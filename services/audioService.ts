import { Audio } from 'expo-av';
import { AudioChannels, SoundType, TimeSignature } from '../types';

// Classe para gerenciar o áudio de cada metrônomo
class MetronomeAudioManager {
  private sound: Audio.Sound | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentBeat: number = 0;
  private isInitialized: boolean = false;

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
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
    }
  }

  // Carregar o som baseado no tipo
  private async loadSound(soundType: SoundType): Promise<void> {
    try {
      // Descarregar som anterior se existir
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // TEMPORÁRIO: Comentado até adicionar arquivos de som
      // const { sound } = await Audio.Sound.createAsync(
      //   this.getSoundSource(soundType),
      //   { shouldPlay: false }
      // );
      // this.sound = sound;
      
      console.log('Som carregado (modo temporário):', soundType);
    } catch (error) {
      console.error('Erro ao carregar som:', error);
    }
  }

  // Retornar a fonte do som (depois substituir por arquivos reais)
  private getSoundSource(soundType: SoundType) {
    // Por enquanto retorna require genérico
    // Você pode adicionar os arquivos de som depois
    switch (soundType) {
      case 'original':
        return require('../assets/sounds/click-original.wav');
      case 'soft':
        return require('../assets/sounds/click-soft.wav');
      case 'electronic':
        return require('../assets/sounds/click-electronic.wav');
      case 'wood':
        return require('../assets/sounds/click-wood.wav');
      case 'digital':
        return require('../assets/sounds/click-digital.wav');
      default:
        return require('../assets/sounds/click-original.wav');
    }
  }

  // Tocar um click
  private async playClick(isAccented: boolean = false) {
    try {
      // TEMPORÁRIO: Log ao invés de tocar som
      console.log('Click:', isAccented ? 'ACENTUADO' : 'normal');
      
      // if (!this.sound) return;
      // await this.sound.setPositionAsync(0);
      // const volume = isAccented ? 1.0 : 0.7;
      // await this.sound.setVolumeAsync(volume);
      // await this.sound.playAsync();
    } catch (error) {
      console.error('Erro ao tocar click:', error);
    }
  }

  // Calcular quantos tempos tem o compasso
  private getBeatsInMeasure(timeSignature: TimeSignature): number {
    const [beats] = timeSignature.split('/').map(Number);
    return beats;
  }

  // Iniciar metrônomo
  async start(
    bpm: number,
    timeSignature: TimeSignature,
    soundType: SoundType,
    channels: AudioChannels
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeAudio();
    }

    // Carregar o som
    await this.loadSound(soundType);

    // Calcular intervalo entre clicks (em ms)
    const interval = (60 / bpm) * 1000;
    
    // Número de tempos no compasso
    const beatsInMeasure = this.getBeatsInMeasure(timeSignature);
    
    // Resetar contador
    this.currentBeat = 0;

    // Tocar imediatamente o primeiro click
    this.playClick(true);
    
    // Configurar intervalo para os próximos clicks
    this.intervalId = setInterval(() => {
      this.currentBeat = (this.currentBeat + 1) % beatsInMeasure;
      const isAccented = this.currentBeat === 0;
      this.playClick(isAccented);
    }, interval);
  }

  // Parar metrônomo
  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentBeat = 0;
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
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
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