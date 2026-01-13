import { Audio } from 'expo-av';
import { AudioChannels, SoundType, TimeSignature } from '../types';

// Classe para gerenciar o áudio de cada metrônomo
class MetronomeAudioManager {
  private soundPool: Audio.Sound[] = [];
  private currentSoundIndex: number = 0;
  private poolSize: number = 4;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentBeat: number = 0;
  private isInitialized: boolean = false;
  private nextBeatTime: number = 0;
  private isPlaying: boolean = false;
  private bpm: number = 120;
  private beatsInMeasure: number = 4;
  private soundType: SoundType = 'original';

  constructor() {
    this.initializeAudio();
  }

  // Inicializar configurações de áudio
  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
      console.log('Áudio inicializado');
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
    }
  }

  // Carregar arquivo de som
  private async loadSound(soundType: SoundType): Promise<void> {
    try {
      // Limpar pool antigo
      for (const sound of this.soundPool) {
        await sound.unloadAsync();
      }
      this.soundPool = [];

      // Criar pool de sons
      const soundSource = this.getSoundSource(soundType);
      
      for (let i = 0; i < this.poolSize; i++) {
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: false }
        );
        this.soundPool.push(sound);
      }
      
      this.currentSoundIndex = 0;
      console.log('Pool de sons carregado:', soundType);
    } catch (error) {
      console.error('Erro ao carregar som:', error);
    }
  }

  // Mapear tipo de som para arquivo
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

  // Tocar um click
  private async playClick(isAccented: boolean = false) {
    try {
      if (this.soundPool.length === 0 || !this.isPlaying) {
        return;
      }

      // Pegar próximo som do pool
      const sound = this.soundPool[this.currentSoundIndex];
      this.currentSoundIndex = (this.currentSoundIndex + 1) % this.poolSize;

      // Parar som se ainda estiver tocando
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
      }

      // Resetar e tocar
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(isAccented ? 1.0 : 0.7);
      await sound.playAsync();

      console.log('Click:', this.currentBeat, isAccented ? 'ACENTUADO' : 'normal');
    } catch (error) {
      console.error('Erro ao tocar click:', error);
    }
  }

  // Calcular quantos tempos tem o compasso
  private getBeatsInMeasure(timeSignature: TimeSignature): number {
    // Extrair numerador do compasso (ex: "4/4" -> 4, "6/8" -> 6)
    const numerator = parseInt(timeSignature.split('/')[0]);
    console.log('Compasso:', timeSignature, '=', numerator, 'tempos');
    return numerator;
  }

  // Iniciar metrônomo
  async start(
    bpm: number,
    timeSignature: TimeSignature,
    soundType: SoundType,
    channels: AudioChannels
  ): Promise<void> {
    console.log('=== START chamado ===');
    
    // Parar se já estiver tocando
    if (this.isPlaying) {
      console.log('Já estava tocando, parando primeiro...');
      await this.stop();
    }

    if (!this.isInitialized) {
      await this.initializeAudio();
    }

    // Salvar configurações
    this.bpm = bpm;
    this.beatsInMeasure = this.getBeatsInMeasure(timeSignature);

    // Carregar pool de sons APENAS se mudou o tipo ou não existe
    if (this.soundType !== soundType || this.soundPool.length === 0) {
      console.log('Carregando novo som:', soundType);
      this.soundType = soundType;
      await this.loadSound(soundType);
    }

    console.log('Iniciando metrônomo:', bpm, 'BPM, Compasso:', timeSignature, '(', this.beatsInMeasure, 'tempos)');

    // Calcular intervalo em milissegundos
    const interval = (60 / bpm) * 1000;
    
    // Resetar contador
    this.currentBeat = -1;

    // IMPORTANTE: Marcar como playing ANTES de começar o loop
    this.isPlaying = true;

    // Loop de timing preciso
    const startTime = Date.now();
    let beatCount = 0;

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;

      const now = Date.now();
      const expectedTime = startTime + (beatCount * interval);
      
      if (now >= expectedTime - 5) {
        this.currentBeat = (this.currentBeat + 1) % this.beatsInMeasure;
        const isAccented = this.currentBeat === 0;
        
        this.playClick(isAccented);
        beatCount++;
      }
    }, 5);
    
    console.log('Metrônomo iniciado com sucesso!');
  }

  // Parar metrônomo
  async stop(): Promise<void> {
    console.log('Parando metrônomo...');
    this.isPlaying = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.currentBeat = 0;
    this.nextBeatTime = 0;

    // Parar todos os sons do pool
    try {
      for (const sound of this.soundPool) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.stopAsync();
        }
      }
    } catch (error) {
      console.error('Erro ao parar sons:', error);
    }
  }

  // Atualizar BPM durante reprodução
  async updateBpm(
    newBpm: number,
    timeSignature: TimeSignature,
    soundType: SoundType,
    channels: AudioChannels
  ): Promise<void> {
    const wasPlaying = this.intervalId !== null;
    
    if (wasPlaying) {
      await this.stop();
      await this.start(newBpm, timeSignature, soundType, channels);
    }
  }

  // Limpar recursos
  async cleanup(): Promise<void> {
    await this.stop();
    for (const sound of this.soundPool) {
      await sound.unloadAsync();
    }
    this.soundPool = [];
  }
}

// Gerenciador global de múltiplos metrônomos
class AudioService {
  private metronomes: Map<string, MetronomeAudioManager> = new Map();

  // Criar um novo metrônomo
  createMetronome(id: string): void {
    if (!this.metronomes.has(id)) {
      this.metronomes.set(id, new MetronomeAudioManager());
    }
  }

  // Iniciar metrônomo específico
  async startMetronome(
    id: string,
    bpm: number,
    timeSignature: TimeSignature,
    soundType: SoundType,
    channels: AudioChannels
  ): Promise<void> {
    const metronome = this.metronomes.get(id);
    if (metronome) {
      await metronome.start(bpm, timeSignature, soundType, channels);
    }
  }

  // Parar metrônomo específico
  async stopMetronome(id: string): Promise<void> {
    const metronome = this.metronomes.get(id);
    if (metronome) {
      await metronome.stop();
    }
  }

  // Atualizar BPM de metrônomo específico
  async updateMetronomeBpm(
    id: string,
    newBpm: number,
    timeSignature: TimeSignature,
    soundType: SoundType,
    channels: AudioChannels
  ): Promise<void> {
    const metronome = this.metronomes.get(id);
    if (metronome) {
      await metronome.updateBpm(newBpm, timeSignature, soundType, channels);
    }
  }

  // Remover metrônomo
  async removeMetronome(id: string): Promise<void> {
    const metronome = this.metronomes.get(id);
    if (metronome) {
      await metronome.cleanup();
      this.metronomes.delete(id);
    }
  }

  // Parar todos os metrônomos
  async stopAll(): Promise<void> {
    const promises = Array.from(this.metronomes.values()).map(m => m.stop());
    await Promise.all(promises);
  }

  // Limpar todos os recursos
  async cleanup(): Promise<void> {
    const promises = Array.from(this.metronomes.values()).map(m => m.cleanup());
    await Promise.all(promises);
    this.metronomes.clear();
  }
}

// Exportar instância única (singleton)
export const audioService = new AudioService();