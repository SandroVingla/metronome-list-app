// constants/limits.ts

/**
 * Configurações de limites para versões Lite e Pro
 */

export const APP_LIMITS = {
  LITE: {
    MAX_METRONOMES: 10,
    MAX_SAVED_SETLISTS: 3,
    AVAILABLE_SOUNDS: 2,
    HAS_ADS: false,
    CAN_EXPORT: false,
    MAX_TIME_SIGNATURES: 4,
  },
  PRO: {
    MAX_METRONOMES: Infinity,
    MAX_SAVED_SETLISTS: Infinity,
    AVAILABLE_SOUNDS: 5,
    HAS_ADS: false,
    CAN_EXPORT: true,
    MAX_TIME_SIGNATURES: Infinity,
  },
};

/**
 * Define qual versão está rodando
 * Mude para 'PRO' quando for compilar a versão Pro
 */
export const APP_VERSION: 'LITE' | 'PRO' = 'LITE';

/**
 * Limites ativos baseados na versão atual
 */
export const CURRENT_LIMITS = APP_LIMITS[APP_VERSION];

/**
 * Atalhos para acessar limites específicos
 */
export const MAX_METRONOMES = CURRENT_LIMITS.MAX_METRONOMES;
export const MAX_SAVED_SETLISTS = CURRENT_LIMITS.MAX_SAVED_SETLISTS;
export const AVAILABLE_SOUNDS = CURRENT_LIMITS.AVAILABLE_SOUNDS;
export const HAS_ADS = CURRENT_LIMITS.HAS_ADS;
export const CAN_EXPORT = CURRENT_LIMITS.CAN_EXPORT;

/**
 * Informações sobre upgrade
 */
export const UPGRADE_INFO = {
  PRICE: 'R$ 9,90',
  FEATURES: [
    '♾️ Metrônomos ilimitados',
    '🎵 5+ timbres de click',
    '📁 Setlists ilimitados',
    '🚫 Sem anúncios',
    '📤 Exportar/Importar',
    '🎨 Temas personalizados',
  ],
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.sandrovingla.metronomelist.pro',
};

/**
 * Função helper para verificar se pode adicionar mais
 */
export function canAddMore(currentCount: number): boolean {
  if (MAX_METRONOMES === Infinity) return true;
  return currentCount < MAX_METRONOMES;
}

/**
 * Função helper para calcular slots restantes
 */
export function remainingSlots(currentCount: number): number {
  if (MAX_METRONOMES === Infinity) return Infinity;
  return Math.max(0, MAX_METRONOMES - currentCount);
}

/**
 * Mensagem de limite atingido
 */
export function getLimitMessage(feature: 'metronomes' | 'setlists'): string {
  const limits = {
    metronomes: `A versão Lite permite até ${MAX_METRONOMES} metrônomos simultâneos.`,
    setlists: `A versão Lite permite salvar até ${MAX_SAVED_SETLISTS} setlists.`,
  };
  
  return `${limits[feature]}\n\n✨ Upgrade para Pro e tenha ${feature === 'metronomes' ? 'metrônomos' : 'setlists'} ilimitados!`;
}