import {
  POWER_UP_CONFIG
} from '../config/constants';
import MathUtils from '../utils/Math';

export default class PowerUpService {
  nextSpawnTime = 0;
  lastSpawn = Phaser.Math.MAX_SAFE_INTEGER;
  available = [];
  powerUpWeights = [];

  constructor(scene) {
    this.scene = scene;
    this.powerUpConfigTypes = Object.values(POWER_UP_CONFIG.TYPES);
    this.powerUpWeights = this.powerUpConfigTypes.map((type) => type.weight);
  }

  preload() {
    Object.values(POWER_UP_CONFIG.TYPES).forEach(({
      svgAsset
    }) => {
      this.scene.load.svg(svgAsset, 'assets/svg/' + svgAsset + '.svg');
    });
  }

  start() {
    this.lastSpawn = this.scene.time.now;
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
    const index = MathUtils.GetWeightedRandomIndex(this.powerUpWeights);
    return new this.powerUpConfigTypes[index].PowerUpClass(
      this.scene,
      x,
      y,
      this.powerUpConfigTypes[index].svgAsset
    ).init();
  }

  update(time) {
    this.tidyNonConsumable();

    if (time > this.lastSpawn + this.nextSpawnTime) {
      this.available.push(this.spawn(time));
      this.lastSpawn = time;
      this.setSpawnTime();
    }
  }

  tidyNonConsumable() {
    this.available = this.available.filter((powerUp) => powerUp.isActive);
  }
}
