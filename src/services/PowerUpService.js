import Grow from '../entities/power-ups/Grow';
import SpeedUp from '../entities/power-ups/SpeedUp';
import Slip from '../entities/power-ups/Slip';
import {
  POWER_UP_CONFIG
} from '../config/constants';

const POWER_UP_CLASSES = [
  Grow,
  SpeedUp,
  Slip
];

export default class PowerUpService {
  nextSpawnTime = 0;
  lastSpawn = 0;

  constructor(scene) {
    this.scene = scene;
  }

  preload() {
    POWER_UP_CLASSES.forEach(klass => {
      const svgAsset = this.getSvgAssetFromClass(klass);
      this.scene.load.svg(svgAsset, 'assets/svg/' + svgAsset + '.svg');
    });
  }

  start() {
    this.setSpawnTime();
  }

  setSpawnTime() {
    this.nextSpawnTime = Phaser.Math.Between(POWER_UP_CONFIG.MIN_SPAWN_TIME, POWER_UP_CONFIG.MAX_SPAWN_TIME);
  }

  spawn() {
    const {
      x, y
    } = this.scene.getRandomGroundPosition();
    const index = Phaser.Math.Between(0, POWER_UP_CLASSES.length - 1);
    const svgAsset = this.getSvgAssetFromClass(POWER_UP_CLASSES[index]);
    return new POWER_UP_CLASSES[index](this.scene, x, y, svgAsset).init();
  }

  getSvgAssetFromClass(klass) {
    return POWER_UP_CONFIG.TYPES[klass.name].svgAsset;
  }

  update(time) {
    if (time > this.lastSpawn + this.nextSpawnTime) {
      this.spawn(time);
      this.lastSpawn = time;
      this.setSpawnTime();
    }
  }
}
