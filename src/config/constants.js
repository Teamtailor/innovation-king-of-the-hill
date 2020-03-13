import Grow from '../entities/power-ups/Grow';
import SpeedUp from '../entities/power-ups/SpeedUp';
import Slip from '../entities/power-ups/Slip';
import Drunk from '../entities/power-ups/Drunk';

const SCALE = 1;

// Make it divisible by eight for pixelArt
export default {
  WIDTH: 1280 * SCALE,
  HEIGHT: 950 * SCALE,
  SCALE: SCALE
};

export const GAME_CONFIG = {
  DEFAULT_SPEED: 0.05,
  AI: {
    DEFAULT_SPEED: 0.0486,
    SPEED_RANDOMNESS: 0.00145,
    TARGET_TIREDNESS_TIME_MIN: 2500,
    TARGET_TIREDNESS_TIME_MAX: 4300
  }
};

export const COLLISION_CATEGORIES = {
  NONE: 0x00,
  DEFAULT: 0x01,
  GROUND: 0x02,
  PLAYER: 0x04,
  POWER_UP: 0x08
};

export const DEPTHS = {
  BACKGROUND: 0,
  UNDER_GROUND: 1,
  GROUND: 2,
  ABOVE_GROUND: 3,
  AIR: 4
};

export const POWER_UP_CONFIG = {
  MIN_SPAWN_TIME: 1500,
  MAX_SPAWN_TIME: 3500,
  IDLE_TIME_MIN: 1800,
  IDLE_TIME_MAX: 3400,

  TYPES: {
    [Grow.name]: {
      PowerUpClass: Grow,
      label: 'FED UP!',
      duration: 4000,
      svgScale: 0.2,
      svgAsset: 'pizza',
      weight: 8
    },
    [Slip.name]: {
      PowerUpClass: Slip,
      label: 'SLIPPIN\'',
      duration: 200,
      svgScale: 0.2,
      svgAsset: 'banana',
      weight: 4
    },
    [SpeedUp.name]: {
      PowerUpClass: SpeedUp,
      label: 'SPEED UP!',
      duration: 2500,
      svgScale: 0.08,
      svgAsset: 'soda-can',
      weight: 6
    },
    [Drunk.name]: {
      PowerUpClass: Drunk,
      label: 'FEELING DIZZY',
      duration: 3000,
      svgScale: 0.18,
      svgAsset: 'cocktail',
      weight: 5
    }
  }
};

export const LEVELS = {
  crazy: {
    shape: 'level',
    background: {
      type: 'StarBackground',
      data: {
        images: ['pizza']
      }
    }
  },
  pink: {
    shape: 'pink'
  }
};
