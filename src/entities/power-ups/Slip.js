import PowerUpBase from './PowerUpBase';

const SLIP_AMOUNT = 0.08;

export default class Slip extends PowerUpBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'banana');
    this.setScale(0.2);
  }

  onAttachToPlayer(player) {
    player.slip(SLIP_AMOUNT);
  }

  onDetachFromPlayer(player) {
    player.unslip(SLIP_AMOUNT);
  }
}
