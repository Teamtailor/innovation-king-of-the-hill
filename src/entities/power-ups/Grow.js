import PowerUpBase from './PowerUpBase';

const LIFETIME = 4000;

const GROW_MODIFIERS = {
  strengthModifier: 7,
  scaleModifier: 3,
  densityModifier: 0.0001
};

export default class Grow extends PowerUpBase {
  effectLifeTime = LIFETIME;

  constructor(scene, x, y) {
    super(scene, x, y, 'pizza');
    this.setScale(0.2);
  }

  onAttachToPlayer(player) {
    player.grow(GROW_MODIFIERS);
  }

  onDetachFromPlayer(player) {
    player.shrink(GROW_MODIFIERS);
  }
}
