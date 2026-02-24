import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { MAX_METRONOMES } from '../constants/limits'; // ✅ ADICIONADO
import { audioService } from '../services/audioService';
import { AudioChannels, BPM_DEFAULT, Metronome, SoundType, TimeSignature } from '../types';
import { useTapTempo } from './useTapTempo';

export const useMetronome = () => {
  // Estado dos metrônomos
  const [metronomes, setMetronomes] = useState<Metronome[]>([
    {
      id: '1',
      name: 'Música 1',
      bpm: 120,
      timeSignature: '4/4',
      isPlaying: false,
      volume: 1.0,
      soundType: 'original',
    },
    {
      id: '2',
      name: 'Música 2',
      bpm: 120,
      timeSignature: '4/4',
      isPlaying: false,
      volume: 1.0,
      soundType: 'original',
    },
    {
      id: '3',
      name: 'Música 3',
      bpm: 120,
      timeSignature: '4/4',
      isPlaying: false,
      volume: 1.0,
      soundType: 'original',
    },
  ]);

  // Contador para próximo ID
  const [nextId, setNextId] = useState(4);

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

  // NOVA FUNÇÃO: Pausar todos os metrônomos
  const pauseAll = useCallback(async () => {
    console.log('⏸️ Pausando todos os metrônomos');
    
    // Parar todos no audioService
    await audioService.stopAll();
    
    // Atualizar estado
    setMetronomes((prev) =>
      prev.map((m) => ({ ...m, isPlaying: false }))
    );
  }, []);

  // Toggle play/pause de um metrônomo
  const toggleMetronome = useCallback(
    async (id: string) => {
      const metro = metronomes.find((m) => m.id === id);
      if (!metro) return;

      console.log('Toggle metrônomo:', id, 'isPlaying:', metro.isPlaying);

      // Haptic feedback
      if (hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (metro.isPlaying) {
        // Parar o metrônomo atual
        console.log('Parando metrônomo:', id);
        setMetronomes((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isPlaying: false } : m))
        );
        await audioService.stopMetronome(id);
      } else {
        // PARAR TODOS OS OUTROS PRIMEIRO
        const playingMetronomes = metronomes.filter(m => m.isPlaying && m.id !== id);
        
        for (const m of playingMetronomes) {
          console.log('Parando outro metrônomo:', m.id);
          await audioService.stopMetronome(m.id);
        }

        // Atualizar estado - parar todos e iniciar o selecionado
        setMetronomes((prev) =>
          prev.map((m) => ({
            ...m,
            isPlaying: m.id === id,
          }))
        );
        
        console.log('Iniciando metrônomo:', id);
        
        // Iniciar o metrônomo selecionado
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

      // APENAS atualizar áudio se ESTE metrônomo específico estiver tocando
      if (metro.isPlaying) {
        console.log('Atualizando BPM do metrônomo tocando:', id, validBpm);
        await audioService.updateMetronomeBpm(
          id,
          validBpm,
          metro.timeSignature,
          soundType,
          channels
        );
      } else {
        console.log('BPM atualizado (metrônomo parado):', id, validBpm);
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

  // ✅ MODIFICADO: Adicionar novo metrônomo COM VALIDAÇÃO DE LIMITE
  const addMetronome = useCallback(() => {
    // ✅ VALIDAR LIMITE ANTES DE ADICIONAR
    if (metronomes.length >= MAX_METRONOMES) {
      console.log('⚠️ Limite de metrônomos atingido');
      return false; // Retorna false quando não adiciona
    }

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
    
    return true; // ✅ Retorna true quando adiciona com sucesso
  }, [metronomes, nextId, hapticEnabled]);

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

  // Toggle canal de áudio - MODO EXCLUSIVO (sempre 1 ativo)
  const toggleChannel = useCallback(
    async (channel: keyof AudioChannels) => {
      setChannels((prev) => {
        // Se clicou no que já está ativo SOZINHO, mantém ele ativo (não desativa)
        if (prev[channel] && 
            ((channel === 'L' && !prev.R && !prev.C) ||
             (channel === 'R' && !prev.L && !prev.C) ||
             (channel === 'C' && !prev.L && !prev.R))) {
          console.log(`🔘 ${channel} já está ativo - mantendo`);
          return prev; // Não muda nada
        }
        
        // Ativa apenas o canal clicado
        const newChannels: AudioChannels = {
          L: channel === 'L',
          R: channel === 'R',
          C: channel === 'C',
        };

        console.log(`🔘 Canal ${channel} ATIVADO → L=${newChannels.L} R=${newChannels.R} C=${newChannels.C}`);

        // Atualizar metrônomo que está tocando COM OS NOVOS CANAIS
        const playingMetronome = metronomes.find((m) => m.isPlaying);
        if (playingMetronome) {
          // Reiniciar com novos canais
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
    },
    [metronomes, soundType]
  );

  // Mudar tipo de som
  const changeSoundType = useCallback(
    async (newSoundType: SoundType) => {
      const previousSoundType = soundType;
      setSoundType(newSoundType);
      
      // Se tem metrônomo tocando, reiniciar com novo som
      const playingMetronome = metronomes.find((m) => m.isPlaying);
      if (playingMetronome) {
        console.log(`🎵 Trocando som: ${previousSoundType} → ${newSoundType}`);
        
        // Parar suavemente
        await audioService.stopMetronome(playingMetronome.id);
        
        // Pequeno delay para garantir que parou
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Reiniciar com novo som
        await audioService.startMetronome(
          playingMetronome.id,
          playingMetronome.bpm,
          playingMetronome.timeSignature,
          newSoundType,
          channels
        );
        
        console.log(`✅ Som trocado para: ${newSoundType}`);
      }
    },
    [metronomes, channels, soundType]
  );

  // Parar todos os metrônomos
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

  // ✅ RETURN MODIFICADO COM NOVAS PROPRIEDADES
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
    
    // ✅ NOVAS PROPRIEDADES ADICIONADAS
    canAddMore: metronomes.length < MAX_METRONOMES,
    remainingSlots: MAX_METRONOMES - metronomes.length,
  };
};