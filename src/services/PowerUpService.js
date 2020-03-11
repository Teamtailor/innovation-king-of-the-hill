import Grow from '../entities/power-ups/Grow';

const MIN_SPAWN_TIME = 4200;
const MAX_SPAWN_TIME = 9500;

const POWER_UPS = [
  Grow
];

export default class PowerUpService {
  constructor(scene) {
    this.scene = scene;
    this.nextSpawnTime = 0;
    this.lastSpawn = 0;
  }

  init() {
    this.scene.load.svg('pizza', 'assets/svg/pizza.svg');
    this.setSpawnTime();
  }

  setSpawnTime() {
    this.nextSpawnTime = Phaser.Math.Between(MIN_SPAWN_TIME, MAX_SPAWN_TIME);
  }

  spawn() {
    this.getNextPowerUp();
  }

  getNextPowerUp() {
    const {
      x, y
    } = this.scene.getRandomGroundPosition();
    return new POWER_UPS[0](this.scene, x, y);
  }

  update(time) {
    if (time > this.lastSpawn + this.nextSpawnTime) {
      this.spawn(time);
      this.lastSpawn = time;
      this.setSpawnTime();
    }
  }
}
