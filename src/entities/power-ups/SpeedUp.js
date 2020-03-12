import PowerUpBase from './PowerUpBase';

const LIFETIME = 2500;
const SPEED_MODIFIER = 1.2;

export default class SpeedUp extends PowerUpBase {
  effectLifeTime = LIFETIME;
  label = 'SPEED UP!';

  constructor(scene, x, y) {
    super(scene, x, y, 'soda-can');
    this.setScale(0.08);
  }

  onAttachToPlayer(player) {
    player.speedUp(SPEED_MODIFIER);
  }

  onDetachFromPlayer(player) {
    player.slowDown(SPEED_MODIFIER);
  }
}
