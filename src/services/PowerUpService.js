import Grow from '../entities/power-ups/Grow';
import SpeedUp from '../entities/power-ups/SpeedUp';

const MIN_SPAWN_TIME = 2000;
const MAX_SPAWN_TIME = 5500;

const POWER_UPS = [
  Grow,
  SpeedUp
];

export default class PowerUpService {
  nextSpawnTime = 0;
  lastSpawn = 0;

  constructor(scene) {
    this.scene = scene;
  }

  preload() {
    this.scene.load.svg('pizza', 'assets/svg/pizza.svg');
    this.scene.load.svg('soda-can', 'assets/svg/soda-can.svg');
  }

  start() {
    this.setSpawnTime();
  }

  setSpawnTime() {
    this.nextSpawnTime = Phaser.Math.Between(MIN_SPAWN_TIME, MAX_SPAWN_TIME);
  }

  spawn() {
    const {
      x, y
    } = this.scene.getRandomGroundPosition();
    const index = Phaser.Math.Between(0, POWER_UPS.length - 1);
    return new POWER_UPS[index](this.scene, x, y).init();
  }

  update(time) {
    if (time > this.lastSpawn + this.nextSpawnTime) {
      this.spawn(time);
      this.lastSpawn = time;
      this.setSpawnTime();
    }
  }
}
