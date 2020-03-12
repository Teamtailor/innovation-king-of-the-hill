import {
  POWER_UP_CONFIG
} from '../config/constants';

export default class PowerUpService {
  nextSpawnTime = 0;
  lastSpawn = 0;

  constructor(scene) {
    this.scene = scene;
    this.powerUpConfigTypes = Object.values(POWER_UP_CONFIG.TYPES);
  }

  preload() {
    Object.values(POWER_UP_CONFIG.TYPES).forEach(({
      svgAsset
    }) => {
      console.log('loading', svgAsset);
      this.scene.load.svg(svgAsset, 'assets/svg/' + svgAsset + '.svg');
    });
  }

  start() {
    this.setSpawnTime();
  }

  setSpawnTime() {
    this.nextSpawnTime = Phaser.Math.Between(
      POWER_UP_CONFIG.MIN_SPAWN_TIME,
      POWER_UP_CONFIG.MAX_SPAWN_TIME
    );
  }

  spawn() {
    const {
      x, y
    } = this.scene.getRandomGroundPosition();
    const index = Phaser.Math.Between(0, this.powerUpConfigTypes.length - 1);
    return new this.powerUpConfigTypes[index].PowerUpClass(
      this.scene,
      x,
      y,
      this.powerUpConfigTypes[index].svgAsset
    ).init();
  }

  update(time) {
    if (time > this.lastSpawn + this.nextSpawnTime) {
      this.spawn(time);
      this.lastSpawn = time;
      this.setSpawnTime();
    }
  }
}
