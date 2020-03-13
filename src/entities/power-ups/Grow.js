import PowerUpBase from './PowerUpBase';

const GROW_MODIFIERS = {
  strengthModifier: 7,
  scaleModifier: 3,
  densityModifier: 0.0001
};

export default class Grow extends PowerUpBase {
  onAttachToPlayer(player) {
    // player.grow(GROW_MODIFIERS);
  }

  onDetachFromPlayer(player) {
    // player.shrink(GROW_MODIFIERS);
  }
}
