import { Audio } from 'expo-av';
import { AudioChannels, SoundType, TimeSignature } from '../types';

// Pool de sons com suporte a L/R/C
class SoundPool {
  private sounds: Map<string, Audio.Sound[]> = new Map();
  private poolSize = 6;
  private currentIndex: Map<string, number> = new Map();
  private loading: Set<string> = new Set();

  async getSound(soundType: SoundType, channel: 'left' | 'right' | 'center'): Promise<Audio.Sound> {
    const key = `${soundType}-${channel}`;
    
    if (!this.sounds.has(key)) {
      await this.createPool(soundType, channel);
    }

    const pool = this.sounds.get(key);
    if (!pool || pool.length === 0) {
      console.error(`❌ Pool vazio para ${key}!`);
      await this.createPool(soundType, channel);
    }

    const pool2 = this.sounds.get(key)!;
    const index = this.currentIndex.get(key) || 0;
    
    this.currentIndex.set(key, (index + 1) % this.poolSize);
    
    return pool2[index];
  }

  private async createPool(soundType: SoundType, channel: 'left' | 'right' | 'center'): Promise<void> {
    const key = `${soundType}-${channel}`;
    
    if (this.loading.has(key)) {
      while (this.loading.has(key)) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return;
    }

    if (this.sounds.has(key)) {
      return;
    }

    this.loading.add(key);
    console.log(`📦 Criando pool: ${key}`);
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const soundSource = this.getSoundSource(soundType, channel);
      const pool: Audio.Sound[] = [];

      for (let i = 0; i < this.poolSize; i++) {
        try {
          const { sound } = await Audio.Sound.createAsync(soundSource, {
            shouldPlay: false,
          });
          pool.push(sound);
        } catch (error) {
          console.error(`❌ Erro ao criar som ${i} de ${key}:`, error);
        }
      }

      if (pool.length > 0) {
        this.sounds.set(key, pool);
        this.currentIndex.set(key, 0);
        console.log(`✅ Pool criado: ${key} (${pool.length} sons)`);
      } else {
        console.error(`❌ Falha ao criar pool: ${key}`);
      }
    } catch (error) {
      console.error(`❌ Erro crítico ao criar pool ${key}:`, error);
    } finally {
      this.loading.delete(key);
    }
  }

  private getSoundSource(soundType: SoundType, channel: 'left' | 'right' | 'center') {
    const sounds: Record<string, any> = {
      'original-left': require('../assets/sounds/click-original-left.wav'),
      'original-right': require('../assets/sounds/click-original-right.wav'),
      'original-center': require('../assets/sounds/click-original-center.wav'),
      
      'soft-left': require('../assets/sounds/click-soft-left.wav'),
      'soft-right': require('../assets/sounds/click-soft-right.wav'),
      'soft-center': require('../assets/sounds/click-soft-center.wav'),
      
      'electronic-left': require('../assets/sounds/click-electronic-left.wav'),
      'electronic-right': require('../assets/sounds/click-electronic-right.wav'),
      'electronic-center': require('../assets/sounds/click-electronic-center.wav'),
      
      'wood-left': require('../assets/sounds/click-wood-left.wav'),
      'wood-right': require('../assets/sounds/click-wood-right.wav'),
      'wood-center': require('../assets/sounds/click-wood-center.wav'),
      
      'digital-left': require('../assets/sounds/click-digital-left.wav'),
      'digital-right': require('../assets/sounds/click-digital-right.wav'),
      'digital-center': require('../assets/sounds/click-digital-center.wav'),
    };
    
    const key = `${soundType}-${channel}`;
    
    try {
      return sounds[key] || sounds[`${soundType}-center`] || sounds['original-center'];
    } catch (error) {
      console.warn(`⚠️ Arquivo ${key} não encontrado, usando fallback`);
      return sounds['original-center'];
    }
  }

  async cleanup() {
    console.log('🧹 Limpando SoundPool...');
    for (const [key, pool] of this.sounds.entries()) {
      for (const sound of pool) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.unloadAsync();
          }
        } catch (e) {
          // Ignorar
        }
      }
    }
    this.sounds.clear();
    this.currentIndex.clear();
    this.loading.clear();
    console.log('✅ SoundPool limpo');
  }

  async cleanupSoundType(soundType: SoundType) {
    console.log(`🧹 Limpando ${soundType}...`);
    const keysToRemove: string[] = [];
    
    for (const [key, pool] of this.sounds.entries()) {
      if (key.startsWith(soundType)) {
        keysToRemove.push(key);
        for (const sound of pool) {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              await sound.unloadAsync();
            }
          } catch (e) {
            // Ignorar
          }
        }
      }
    }
    
    keysToRemove.forEach(key => {
      this.sounds.delete(key);
      this.currentIndex.delete(key);
    });
    
    console.log(`✅ ${soundType} limpo`);
  }
}

// Timer preciso
class Timer {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private startTime = 0;
  private interval = 0;
  private beatCount = 0;
  private active = false;
  private callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }

  start(bpm: number) {
    this.stop();
    this.interval = (60 / bpm) * 1000;
    this.startTime = Date.now();
    this.beatCount = 0;
    this.active = true;
    this.callback();
    this.beatCount++;
    this.scheduleNext();
  }

  private scheduleNext() {
    if (!this.active) return;

    const nextTime = this.startTime + this.beatCount * this.interval;
    const delay = Math.max(0, nextTime - Date.now());

    this.timeoutId = setTimeout(() => {
      if (!this.active) return;

      this.callback();
      this.beatCount++;
      this.scheduleNext();
    }, delay);
  }

  stop() {
    this.active = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  isRunning() {
    return this.active;
  }
}

// Controller de cada metrônomo
class MetronomeController {
  private timer: Timer;
  private currentBeat: number = 0;
  private beatsInMeasure: number = 4;
  private pool: SoundPool;
  private soundType: SoundType = 'original';
  private channels: AudioChannels = { L: false, R: false, C: true };

  constructor(pool: SoundPool) {
    this.pool = pool;
    this.timer = new Timer(() => this.playBeat());
  }

  async start(bpm: number, timeSignature: TimeSignature, soundType: SoundType, channels: AudioChannels) {
    this.stop();
    
    if (this.soundType && this.soundType !== soundType) {
      console.log(`🔄 Trocando de ${this.soundType} para ${soundType}`);
      await this.pool.cleanupSoundType(this.soundType);
    }
    
    this.soundType = soundType;
    this.channels = channels;
    this.beatsInMeasure = parseInt(timeSignature.split('/')[0]);
    this.currentBeat = 0;
    
    console.log(`⏳ Carregando ${soundType}...`);
    
    try {
      await Promise.all([
        this.pool.getSound(soundType, 'left'),
        this.pool.getSound(soundType, 'right'),
        this.pool.getSound(soundType, 'center'),
      ]);
      
      console.log(`✅ ${soundType} pronto`);
      this.timer.start(bpm);
    } catch (error) {
      console.error(`❌ Erro ao carregar:`, error);
    }
  }

  private async playBeat() {
    try {
      const channel = this.getActiveChannel();
      const sound = await this.pool.getSound(this.soundType, channel);
      
      const isAccented = this.currentBeat === 0;
      const volume = isAccented ? 1.0 : 0.7;

      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume);
      await sound.playAsync();

      this.currentBeat = (this.currentBeat + 1) % this.beatsInMeasure;
    } catch (error) {
      console.error('❌ Erro playBeat:', error);
    }
  }

  private getActiveChannel(): 'left' | 'right' | 'center' {
    const { L, R, C } = this.channels;
    if (L && !R && !C) return 'left';
    if (R && !L && !C) return 'right';
    return 'center';
  }

  stop() {
    this.timer.stop();
  }

  isPlaying() {
    return this.timer.isRunning();
  }
}

// Service principal
class AudioService {
  private pool: SoundPool;
  private controllers: Map<string, MetronomeController> = new Map();

  constructor() {
    this.pool = new SoundPool();
    console.log('🔊 Áudio OK');
  }

  createMetronome(id: string) {
    if (!this.controllers.has(id)) {
      console.log(`🆕 Criando: ${id}`);
      this.controllers.set(id, new MetronomeController(this.pool));
    }
  }

  async startMetronome(
    id: string,
    bpm: number,
    timeSignature: TimeSignature,
    soundType: SoundType,
    channels: AudioChannels
  ) {
    const controller = this.controllers.get(id);
    if (!controller) {
      console.error(`❌ ${id} não existe`);
      return;
    }

    console.log(`🎵 Start ${id}: ${bpm} BPM`);
    await controller.start(bpm, timeSignature, soundType, channels);
    console.log(`✅ ${id} pronto!`);
  }

  async stopMetronome(id: string) {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.stop();
      console.log(`⏹️ Stop ${id}`);
    }
  }

  async updateMetronomeBpm(
    id: string,
    newBpm: number,
    timeSignature: TimeSignature,
    soundType: SoundType,
    channels: AudioChannels
  ) {
    const controller = this.controllers.get(id);
    if (controller?.isPlaying()) {
      console.log(`🔄 ${id}: ${newBpm} BPM`);
      await this.stopMetronome(id);
      await this.startMetronome(id, newBpm, timeSignature, soundType, channels);
    }
  }

  async removeMetronome(id: string) {
    await this.stopMetronome(id);
    this.controllers.delete(id);
    console.log(`🗑️ Removido: ${id}`);
  }

  async stopAll() {
    for (const id of this.controllers.keys()) {
      await this.stopMetronome(id);
    }
  }

  async cleanup() {
    await this.stopAll();
    await this.pool.cleanup();
    this.controllers.clear();
    console.log('🧹 Cleanup');
  }
}

export const audioService = new AudioService();