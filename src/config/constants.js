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
