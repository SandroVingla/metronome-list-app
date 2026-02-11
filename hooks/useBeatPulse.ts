import { useEffect, useRef, useState } from 'react';

interface UseBeatPulseProps {
  isPlaying: boolean;
  bpm: number;
  onBeat?: () => void;
}

export const useBeatPulse = ({ isPlaying, bpm, onBeat }: UseBeatPulseProps) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying && bpm > 0) {
      // Calcular intervalo em ms
      const interval = (60 / bpm) * 1000;

      // Pulsar imediatamente
      triggerPulse();

      // Criar intervalo
      intervalRef.current = setInterval(() => {
        triggerPulse();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsPulsing(false);
      };
    } else {
      // Limpar quando parar
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPulsing(false);
    }
  }, [isPlaying, bpm]);

  const triggerPulse = () => {
    setIsPulsing(true);
    
    // Callback opcional
    if (onBeat) {
      onBeat();
    }

    // Desativar pulse após 150ms
    setTimeout(() => {
      setIsPulsing(false);
    }, 150);
  };

  return { isPulsing };
};