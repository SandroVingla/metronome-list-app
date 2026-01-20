import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { audioService } from '../services/audioService';
import { AudioChannels, BPM_DEFAULT, Metronome, SoundType, TimeSignature } from '../types';
import { useTapTempo } from './useTapTempo';

export const useMetronome = () => {
  // Estado dos metrónomos
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

  // Contador para próximo ID
  const [nextId, setNextId] = useState(4);

  // Configurações globais - MODO EXCLUSIVO
  const [channels, setChannels] = useState<AudioChannels>({
    L: false,
    R: false,
    C: true,
  });

  const [soundType, setSoundType] = useState<SoundType>('original');
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Tap Tempo hook
  const { tapTempo: performTap, calculatedBpm, tapCount, reset: resetTap } = useTapTempo();

  // Inicializar metrónomos no audioService
  useEffect(() => {
    metronomes.forEach((metro) => {
      audioService.createMetronome(metro.id);
    });

    // Cleanup quando desmontar
    return () => {
      audioService.cleanup();
    };
  }, []);

  // NOVA FUNÇÃO: Pausar todos os metrónomos
  const pauseAll = useCallback(async () => {
    console.log('⏸️ Pausando todos os metrónomos');
    
    // Parar todos no audioService
    await audioService.stopAll();
    
    // Atualizar estado
    setMetronomes((prev) =>
      prev.map((m) => ({ ...m, isPlaying: false }))
    );
  }, []);

  // Toggle play/pause de um metrónomo
  const toggleMetronome = useCallback(
    async (id: string) => {
      const metro = metronomes.find((m) => m.id === id);
      if (!metro) return;

      console.log('Toggle metrónomo:', id, 'isPlaying:', metro.isPlaying);

      // Haptic feedback
      if (hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (metro.isPlaying) {
        // Parar o metrónomo atual
        console.log('Parando metrónomo:', id);
        setMetronomes((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isPlaying: false } : m))
        );
        await audioService.stopMetronome(id);
      } else {
        // PARAR TODOS OS OUTROS PRIMEIRO
        const playingMetronomes = metronomes.filter(m => m.isPlaying && m.id !== id);
        
        for (const m of playingMetronomes) {
          console.log('Parando outro metrónomo:', m.id);
          await audioService.stopMetronome(m.id);
        }

        // Atualizar estado - parar todos e iniciar o selecionado
        setMetronomes((prev) =>
          prev.map((m) => ({
            ...m,
            isPlaying: m.id === id,
          }))
        );
        
        console.log('Iniciando metrónomo:', id);
        
        // Iniciar o metrónomo selecionado
        await audioService.startMetronome(
          id,
          metro.bpm,
          metro.timeSignature,
          soundType,
          channels
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

      // Atualizar estado
      setMetronomes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, bpm: validBpm } : m))
      );

      // APENAS atualizar áudio se ESTE metrónomo específico estiver tocando
      if (metro.isPlaying) {
        console.log('Atualizando BPM do metrónomo tocando:', id, validBpm);
        await audioService.updateMetronomeBpm(
          id,
          validBpm,
          metro.timeSignature,
          soundType,
          channels
        );
      } else {
        console.log('BPM atualizado (metrónomo parado):', id, validBpm);
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

  // Adicionar novo metrónomo
  const addMetronome = useCallback(() => {
    const newId = String(nextId);
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
    setNextId(prev => prev + 1);
    
    // IMPORTANTE: Criar o audioService imediatamente
    audioService.createMetronome(newId);

    // Haptic feedback
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [metronomes, nextId, hapticEnabled]);

  // Deletar metrónomo
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

  // Toggle canal de áudio - MODO EXCLUSIVO (só um por vez)
  const toggleChannel = useCallback(
    async (channel: keyof AudioChannels) => {
      setChannels((prev) => {
        // Se clicar no canal já ativo, desativa tudo
        if (prev[channel] && !Object.values(prev).filter((v, i) => 
          i !== Object.keys(prev).indexOf(channel)
        ).some(v => v)) {
          const newChannels: AudioChannels = { L: false, R: false, C: false };
          console.log(`🔘 Canal ${channel} DESATIVADO → TODOS DESLIGADOS`);
          
          // Parar metrônomo tocando se ficar mudo
          const playingMetronome = metronomes.find((m) => m.isPlaying);
          if (playingMetronome) {
            audioService.stopMetronome(playingMetronome.id).then(() => {
              audioService.startMetronome(
                playingMetronome.id,
                playingMetronome.bpm,
                playingMetronome.timeSignature,
                soundType,
                newChannels
              );
            });
          }
          
          return newChannels;
        }
        
        // Ativar apenas o canal clicado (desativar todos os outros)
        const newChannels: AudioChannels = {
          L: channel === 'L',
          R: channel === 'R',
          C: channel === 'C',
        };

        console.log(`🔘 Canal ${channel} ATIVADO → L=${newChannels.L} R=${newChannels.R} C=${newChannels.C}`);

        // Atualizar metrónomo que está tocando
        const playingMetronome = metronomes.find((m) => m.isPlaying);
        if (playingMetronome) {
          audioService.stopMetronome(playingMetronome.id).then(() => {
            audioService.startMetronome(
              playingMetronome.id,
              playingMetronome.bpm,
              playingMetronome.timeSignature,
              soundType,
              newChannels
            );
          });
        }

        return newChannels;
      });

      // Haptic feedback
      if (hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [metronomes, soundType, hapticEnabled]
  );

  // Mudar tipo de som
  const changeSoundType = useCallback((newSoundType: SoundType) => {
    setSoundType(newSoundType);
  }, []);

  // Parar todos os metrónomos
  const stopAll = useCallback(async () => {
    await audioService.stopAll();
    setMetronomes((prev) => prev.map((m) => ({ ...m, isPlaying: false })));
  }, []);

  // Tap Tempo
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
    pauseAll,
    tapTempo,
    resetTap,
    setHapticEnabled,
  };
};