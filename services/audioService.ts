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

    const pool = this.sounds.get(key)!;
    const index = this.currentIndex.get(key) || 0;
    
    this.currentIndex.set(key, (index + 1) % this.poolSize);
    
    return pool[index];
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
        const { sound } = await Audio.Sound.createAsync(soundSource, {
          shouldPlay: false,
        });
        pool.push(sound);
      }

      this.sounds.set(key, pool);
      this.currentIndex.set(key, 0);
      console.log(`✅ Pool criado: ${key}`);
    } finally {
      this.loading.delete(key);
    }
  }

  private getSoundSource(soundType: SoundType, channel: 'left' | 'right' | 'center') {
    // Mapear para os arquivos corretos
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
    
    // Se não existir, usa o center como fallback
    try {
      return sounds[key] || sounds[`${soundType}-center`] || sounds['original-center'];
    } catch (error) {
      console.warn(`⚠️ Arquivo ${key} não encontrado, usando fallback`);
      return sounds['original-center'];
    }
  }

  async cleanup() {
    for (const pool of this.sounds.values()) {
      for (const sound of pool) {
        try {
          await sound.unloadAsync();
        } catch (e) {}
      }
    }
    this.sounds.clear();
    this.currentIndex.clear();
  }
}

// Timer
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

// Controller
class MetronomeController {
  private timer: Timer;
  private currentBeat = 0;
  private beatsInMeasure = 4;
  private soundPool: SoundPool;
  private soundType: SoundType = 'original';
  private channels: AudioChannels = { L: false, R: false, C: true };

  constructor(soundPool: SoundPool) {
    this.soundPool = soundPool;
    this.timer = new Timer(() => this.playBeat());
  }

  async start(bpm: number, timeSignature: TimeSignature, soundType: SoundType, channels: AudioChannels) {
    this.stop();
    this.soundType = soundType;
    this.channels = channels;
    this.beatsInMeasure = parseInt(timeSignature.split('/')[0]);
    this.currentBeat = 0;
    
    console.log(`⏳ Carregando sons para: ${soundType}...`);
    
    // Pré-carregar TODOS os canais possíveis (evita lag ao trocar)
    // AGUARDAR completar antes de iniciar o timer
    await Promise.all([
      this.soundPool.getSound(soundType, 'left'),
      this.soundPool.getSound(soundType, 'right'),
      this.soundPool.getSound(soundType, 'center'),
    ]);
    
    console.log(`✅ Sons carregados: ${soundType}`);
    
    this.timer.start(bpm);
  }

  private getActiveChannel(): 'left' | 'right' | 'center' {
    const { L, R, C } = this.channels;
    
    // Apenas L
    if (L && !R && !C) return 'left';
    
    // Apenas R
    if (R && !L && !C) return 'right';
    
    // Qualquer coisa com C, ou padrão
    return 'center';
  }

  private async playBeat() {
    try {
      const channel = this.getActiveChannel();
      const sound = await this.soundPool.getSound(this.soundType, channel);
      const isAccented = this.currentBeat === 0;
      const volume = isAccented ? 1.0 : 0.7;

      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume);
      await sound.playAsync();

      // Sem logs durante playback (melhor performance)

      this.currentBeat = (this.currentBeat + 1) % this.beatsInMeasure;
    } catch (error) {
      // Ignorar
    }
  }

  private getPanDescription(): string {
    const { L, R, C } = this.channels;
    if (L && !R && !C) return '⬅️ Esquerda';
    if (R && !L && !C) return '➡️ Direita';
    return '⏺️ Centro';
  }

  stop() {
    this.timer.stop();
  }

  isPlaying() {
    return this.timer.isRunning();
  }
}

// Service
class AudioService {
  private soundPool: SoundPool;
  private controllers: Map<string, MetronomeController> = new Map();

  constructor() {
    this.soundPool = new SoundPool();
    console.log('🔊 Áudio OK (arquivos L/R/C)');
  }

  createMetronome(id: string) {
    if (!this.controllers.has(id)) {
      console.log(`🆕 Criando: ${id}`);
      this.controllers.set(id, new MetronomeController(this.soundPool));
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
    await this.soundPool.cleanup();
    this.controllers.clear();
    console.log('🧹 Cleanup');
  }
}

export const audioService = new AudioService();