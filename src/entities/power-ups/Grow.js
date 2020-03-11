
import PowerUpBase from './PowerUpBase';

export default class Grow extends PowerUpBase {
  label = 'PowerUp::Grow';

  constructor(scene, x, y) {
    super(scene, x, y, 'pizza');
    this.setScale(0.2);
  }

  applyToPlayer(player) {
    player.grow();
  }
}
