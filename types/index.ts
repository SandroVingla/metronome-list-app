// Tipo principal do metrônomo
export interface Metronome {
  id: string;
  name: string;
  bpm: number;
  timeSignature: TimeSignature;
  isPlaying: boolean;
  volume: number;
  soundType: SoundType;
}

// Tipos de compasso
export type TimeSignature = '2/4' | '3/4' | '4/4' | '5/4' | '6/8' | '7/8' | '9/8' | '12/8';

// Tipos de som do click
export type SoundType = 'original' | 'soft' | 'electronic' | 'wood' | 'digital';

// Canais de áudio (L/R/C)
export interface AudioChannels {
  L: boolean;  // Left
  R: boolean;  // Right
  C: boolean;  // Center
}

// Configurações globais do app
export interface AppSettings {
  channels: AudioChannels;
  defaultBpm: number;
  defaultTimeSignature: TimeSignature;
  defaultSoundType: SoundType;
  keepAwake: boolean;
  hapticFeedback: boolean;
}

// Estado do metrônomo durante reprodução
export interface MetronomePlaybackState {
  currentBeat: number;
  isAccented: boolean;
  nextBeatTime: number;
}

// Props para componentes
export interface MetronomeItemProps {
  metronome: Metronome;
  onTogglePlay: (id: string) => void;
  onUpdateBpm: (id: string, bpm: number) => void;
  onUpdateName: (id: string, name: string) => void;
  onUpdateTimeSignature: (id: string, timeSignature: TimeSignature) => void;
  onDelete: (id: string) => void;
}

export interface ControlPanelProps {
  channels: AudioChannels;
  soundType: SoundType;
  onChannelToggle: (channel: keyof AudioChannels) => void;
  onSoundTypeChange: (soundType: SoundType) => void;
  onTapTempo: () => void;
}

// Tipo para o hook de storage
export interface StorageData {
  metronomes: Metronome[];
  settings: AppSettings;
}

// Constantes de validação
export const BPM_MIN = 40;
export const BPM_MAX = 300;
export const BPM_DEFAULT = 120;

// Helper types
export type MetronomeId = string;
export type BPM = number;