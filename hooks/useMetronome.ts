import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { audioService } from '../services/audioService';
import { AudioChannels, BPM_DEFAULT, Metronome, SoundType, TimeSignature } from '../types';
import { useTapTempo } from './useTapTempo';

export const useMetronome = () => {
  // Estado dos metrônomos
  const [metronomes, setMetronomes] = useState<Metronome[]>([
    {
      id: '1',
      name: 'Música 1',
      bpm: 100,
      timeSignature: '4/4',
      isPlaying: false,
      volume: 1.0,
      soundType: 'original',
    },
    {
      id: '2',
      name: 'Música 2',
      bpm: 134,
      timeSignature: '4/4',
      isPlaying: false,
      volume: 1.0,
      soundType: 'original',
    },
    {
      id: '3',
      name: 'Música 3',
      bpm: 92,
      timeSignature: '4/4',
      isPlaying: false,
      volume: 1.0,
      soundType: 'original',
    },
  ]);

  // Configurações globais
  const [channels, setChannels] = useState<AudioChannels>({
    L: false,
    R: false,
    C: true,
  });

  const [soundType, setSoundType] = useState<SoundType>('original');
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Tap Tempo hook
  const { tapTempo: performTap, calculatedBpm, tapCount, reset: resetTap } = useTapTempo();

  // Inicializar metrônomos no audioService
  useEffect(() => {
    metronomes.forEach((metro) => {
      audioService.createMetronome(metro.id);
    });

    // Cleanup quando desmontar
    return () => {
      audioService.cleanup();
    };
  }, []);

  // Toggle play/pause de um metrônomo
  const toggleMetronome = useCallback(
    async (id: string) => {
      const metro = metronomes.find((m) => m.id === id);
      if (!metro) return;

      // Haptic feedback
      if (hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (metro.isPlaying) {
        // Parar
        await audioService.stopMetronome(id);
        setMetronomes((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isPlaying: false } : m))
        );
      } else {
        // Iniciar
        await audioService.startMetronome(
          id,
          metro.bpm,
          metro.timeSignature,
          soundType,
          channels
        );
        setMetronomes((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isPlaying: true } : m))
        );
      }
    },
    [metronomes, soundType, channels, hapticEnabled]
  );

  // Atualizar BPM
  const updateBpm = useCallback(
    async (id: string, newBpm: number) => {
      const metro = metronomes.find((m) => m.id === id);
      if (!metro) return;

      // Validar BPM (40-300)
      const validBpm = Math.max(40, Math.min(300, newBpm));

      setMetronomes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, bpm: validBpm } : m))
      );

      // Se estiver tocando, atualizar o áudio
      if (metro.isPlaying) {
        await audioService.updateMetronomeBpm(
          id,
          validBpm,
          metro.timeSignature,
          soundType,
          channels
        );
      }
    },
    [metronomes, soundType, channels]
  );

  // Atualizar nome
  const updateName = useCallback((id: string, newName: string) => {
    setMetronomes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
    );
  }, []);

  // Atualizar compasso
  const updateTimeSignature = useCallback(
    async (id: string, newTimeSignature: TimeSignature) => {
      const metro = metronomes.find((m) => m.id === id);
      if (!metro) return;

      setMetronomes((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, timeSignature: newTimeSignature } : m
        )
      );

      // Se estiver tocando, reiniciar com novo compasso
      if (metro.isPlaying) {
        await audioService.stopMetronome(id);
        await audioService.startMetronome(
          id,
          metro.bpm,
          newTimeSignature,
          soundType,
          channels
        );
      }
    },
    [metronomes, soundType, channels]
  );

  // Adicionar novo metrônomo
  const addMetronome = useCallback(() => {
    const newId = String(Date.now());
    const newMetronome: Metronome = {
      id: newId,
      name: `Música ${metronomes.length + 1}`,
      bpm: BPM_DEFAULT,
      timeSignature: '4/4',
      isPlaying: false,
      volume: 1.0,
      soundType: 'original',
    };

    setMetronomes((prev) => [...prev, newMetronome]);
    audioService.createMetronome(newId);

    // Haptic feedback
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [metronomes, hapticEnabled]);

  // Deletar metrônomo
  const deleteMetronome = useCallback(
    async (id: string) => {
      await audioService.removeMetronome(id);
      setMetronomes((prev) => prev.filter((m) => m.id !== id));

      // Haptic feedback
      if (hapticEnabled) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
    },
    [hapticEnabled]
  );

  // Toggle canal de áudio
  const toggleChannel = useCallback((channel: keyof AudioChannels) => {
    setChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  }, []);

  // Mudar tipo de som
  const changeSoundType = useCallback((newSoundType: SoundType) => {
    setSoundType(newSoundType);
  }, []);

  // Parar todos os metrônomos
  const stopAll = useCallback(async () => {
    await audioService.stopAll();
    setMetronomes((prev) => prev.map((m) => ({ ...m, isPlaying: false })));
  }, []);

  // Tap Tempo (para implementar depois)
  const tapTempo = useCallback(async () => {
    // Haptic feedback
    if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    performTap();
  }, [hapticEnabled, performTap]);

  return {
    // Estado
    metronomes,
    channels,
    soundType,
    hapticEnabled,
    calculatedBpm,
    tapCount,

    // Ações
    toggleMetronome,
    updateBpm,
    updateName,
    updateTimeSignature,
    addMetronome,
    deleteMetronome,
    toggleChannel,
    changeSoundType,
    stopAll,
    tapTempo,
    resetTap,
    setHapticEnabled,
  };
};