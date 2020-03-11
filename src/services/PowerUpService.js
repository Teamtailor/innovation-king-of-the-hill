import Grow from '../entities/power-ups/Grow';

const MIN_SPAWN_TIME = 4200;
const MAX_SPAWN_TIME = 9500;

const POWER_UPS = [
  Grow
];

export default class PowerUpService {
  nextSpawnTime = 0;
  lastSpawn = 0;

  constructor(scene) {
    this.scene = scene;
  }

  init() {
    this.scene.load.svg('pizza', 'assets/svg/pizza.svg');
    this.setSpawnTime();
  }

  setSpawnTime() {
    this.nextSpawnTime = Phaser.Math.Between(MIN_SPAWN_TIME, MAX_SPAWN_TIME);
  }

  spawn() {
    const {
      x, y
    } = this.scene.getRandomGroundPosition();
    return new POWER_UPS[0](this.scene, x, y).init();
  }

  update(time) {
    if (time > this.lastSpawn + this.nextSpawnTime) {
      this.spawn(time);
      this.lastSpawn = time;
      this.setSpawnTime();
    }
  }
}
