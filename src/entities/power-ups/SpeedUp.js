import PowerUpBase from './PowerUpBase';

const SPEED_MODIFIER = 1.2;

export default class SpeedUp extends PowerUpBase {
  onAttachToPlayer(player) {
    player.speedUp(SPEED_MODIFIER);
  }

  onDetachFromPlayer(player) {
    player.slowDown(SPEED_MODIFIER);
  }
}
