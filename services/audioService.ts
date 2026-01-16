import { Audio } from 'expo-av';
import { AudioChannels, SoundType, TimeSignature } from '../types';

// Pool global compartilhado - MAIS SIMPLES
class SoundPool {
  private sounds: Map<SoundType, Audio.Sound[]> = new Map();
  private poolSize = 6;
  private currentIndex: Map<SoundType, number> = new Map();

  async getSound(soundType: SoundType): Promise<Audio.Sound> {
    // Criar pool se não existe
    if (!this.sounds.has(soundType)) {
      await this.createPool(soundType);
    }

    const pool = this.sounds.get(soundType)!;
    const index = this.currentIndex.get(soundType) || 0;
    
    // Rotacionar índice
    this.currentIndex.set(soundType, (index + 1) % this.poolSize);
    
    return pool[index];
  }

  private async createPool(soundType: SoundType): Promise<void> {
    console.log(`📦 Criando pool: ${soundType}`);
    
    const soundSource = this.getSoundSource(soundType);
    const pool: Audio.Sound[] = [];

    for (let i = 0; i < this.poolSize; i++) {
      const { sound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: false,
      });
      pool.push(sound);
    }

    this.sounds.set(soundType, pool);
    this.currentIndex.set(soundType, 0);
    console.log(`✅ Pool criado: ${soundType}`);
  }

  private getSoundSource(soundType: SoundType) {
    const sounds = {
      original: require('../assets/sounds/click-original.wav'),
      soft: require('../assets/sounds/click-soft.wav'),
      electronic: require('../assets/sounds/click-electronic.wav'),
      wood: require('../assets/sounds/click-wood.wav'),
      digital: require('../assets/sounds/click-digital.wav'),
    };
    return sounds[soundType] || sounds.original;
  }

  async cleanup() {
    for (const pool of this.sounds.values()) {
      for (const sound of pool) {
        try {
          await sound.unloadAsync();
        } catch (e) {
          // Ignorar
        }
      }
    }
    this.sounds.clear();
    this.currentIndex.clear();
  }
}

// Timer preciso com compensação
class Timer {
  private timeoutId: NodeJS.Timeout | null = null;
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

    // Primeiro beat imediatamente
    this.callback();
    this.beatCount++;

    this.scheduleNext();
    console.log(`▶️ ${bpm} BPM`);
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

// Gerenciador de cada metrônomo
class MetronomeController {
  private timer: Timer;
  private currentBeat = 0;
  private beatsInMeasure = 4;
  private soundPool: SoundPool;
  private soundType: SoundType = 'original';

  constructor(soundPool: SoundPool) {
    this.soundPool = soundPool;
    this.timer = new Timer(() => this.playBeat());
  }

  async start(bpm: number, timeSignature: TimeSignature, soundType: SoundType) {
    this.stop();
    
    this.soundType = soundType;
    this.beatsInMeasure = parseInt(timeSignature.split('/')[0]);
    this.currentBeat = 0;

    this.timer.start(bpm);
  }

  private async playBeat() {
    try {
      const sound = await this.soundPool.getSound(this.soundType);
      const isAccented = this.currentBeat === 0;
      
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(isAccented ? 1.0 : 0.7);
      await sound.playAsync();

      this.currentBeat = (this.currentBeat + 1) % this.beatsInMeasure;
    } catch (error) {
      // Ignorar erros
    }
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
  private soundPool: SoundPool;
  private controllers: Map<string, MetronomeController> = new Map();
  private initialized = false;

  constructor() {
    this.soundPool = new SoundPool();
    this.initAudio();
  }

  private async initAudio() {
    if (this.initialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });
      this.initialized = true;
      console.log('🔊 Áudio OK');
    } catch (error) {
      console.error('❌ Erro áudio:', error);
    }
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
    await controller.start(bpm, timeSignature, soundType);
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