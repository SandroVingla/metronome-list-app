import { useCallback, useRef, useState } from 'react';

interface UseTapTempoReturn {
  tapTempo: () => void;
  calculatedBpm: number | null;
  tapCount: number;
  reset: () => void;
}

export const useTapTempo = (): UseTapTempoReturn => {
  const [calculatedBpm, setCalculatedBpm] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const tapTimestamps = useRef<number[]>([]);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resetar depois de 3 segundos sem tap
  const scheduleReset = useCallback(() => {
    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
    }
    
    resetTimeout.current = setTimeout(() => {
      tapTimestamps.current = [];
      setTapCount(0);
      setCalculatedBpm(null);
    }, 3000);
  }, []);

  // Resetar manualmente
  const reset = useCallback(() => {
    tapTimestamps.current = [];
    setTapCount(0);
    setCalculatedBpm(null);
    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
    }
  }, []);

  // Função principal do tap tempo
  const tapTempo = useCallback(() => {
    const now = Date.now();
    
    // Adicionar timestamp atual
    tapTimestamps.current.push(now);
    setTapCount(tapTimestamps.current.length);

    // Manter apenas os últimos 8 taps (mais preciso)
    if (tapTimestamps.current.length > 8) {
      tapTimestamps.current.shift();
    }

    // Precisa de pelo menos 2 taps para calcular
    if (tapTimestamps.current.length >= 2) {
      // Calcular intervalos entre taps
      const intervals: number[] = [];
      for (let i = 1; i < tapTimestamps.current.length; i++) {
        const interval = tapTimestamps.current[i] - tapTimestamps.current[i - 1];
        intervals.push(interval);
      }

      // Calcular média dos intervalos
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Converter intervalo (ms) para BPM
      // BPM = 60000ms / intervalo_médio
      const bpm = Math.round(60000 / averageInterval);

      // Validar BPM (40-300)
      const validBpm = Math.max(40, Math.min(300, bpm));
      
      setCalculatedBpm(validBpm);
    }

    // Agendar reset automático
    scheduleReset();
  }, [scheduleReset]);

  return {
    tapTempo,
    calculatedBpm,
    tapCount,
    reset,
  };
};