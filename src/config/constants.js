const SCALE = 1;

// Make it divisible by eight for pixelArt
export default {
  WIDTH: 1280 * SCALE,
  HEIGHT: 720 * SCALE,
  SCALE: SCALE
};

export const COLLISION_CATEGORIES = {
  NONE: 0x00,
  DEFAULT: 0x01,
  GROUND: 0x02,
  PLAYER: 0x04,
  POWER_UP: 0x08
};

export const POWER_UP_CONFIG = {
  MIN_SPAWN_TIME: 2000,
  MAX_SPAWN_TIME: 5500,

  TYPES: {
    Grow: {
      label: 'FED UP!',
      duration: 4000,
      svgScale: 0.2,

      svgAsset: 'pizza'
    },
    Slip: {
      label: 'SLIPPIN\'',
      duration: 200,
      svgScale: 0.2,
      svgAsset: 'banana'
    },
    SpeedUp: {
      label: 'SPEED UP!',
      duration: 2500,
      svgScale: 0.08,
      svgAsset: 'soda-can'
    },
    Drunk: {
      label: 'FEELING DIZZY',
      duration: 3000,
      svgScale: 0.18,
      svgAsset: 'cocktail'
    }
  }
};
