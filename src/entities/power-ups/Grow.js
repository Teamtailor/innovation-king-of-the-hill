
import PowerUpBase from './PowerUpBase';

export default class Grow extends PowerUpBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'pizza');
    this.setScale(0.2);
    this.setRandomRotation();
  }
}
