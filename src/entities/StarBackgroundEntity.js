import {
  DEPTHS
} from '../config/constants';

const starAmount = 1000;
let cameraZ = 0;
const fov = 20;
const baseSpeed = 0.025;
let speed = 0;
let warpSpeed = 0;
const starStretch = 5;
const starBaseSize = 0.1;

export default class StarBackgroundEntity {
  sprite = null;
  scene = null;
  stars = [];

  constructor({
    scene, data
  }) {
    this.scene = scene;

    const {
      images
    } = data;

    for (let i = 0; i < starAmount; i++) {
      const image = images[Math.floor(Math.random() * images.length)];
      const star = {
        sprite: this.scene.add.sprite(0, 0, image),
        z: 0,
        x: 0,
        y: 0
      };
      star.sprite.setOrigin(0.5, 0.7);
      star.sprite.setDepth(DEPTHS.BACKGROUND);
      this.randomizeStar(star, true);
      this.stars.push(star);
    }

    setInterval(() => {
      warpSpeed = warpSpeed > 0 ? 0 : 1;
    }, 5000);
  }

  randomizeStar(star, initial) {
    star.z = initial
      ? Math.random() * 2000
      : cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;

    star.sprite.rotation = (Math.random() * 360 * 180) / Math.PI;
  }

  updateSprite(star) {
    if (star.z < cameraZ) this.randomizeStar(star);

    const z = star.z - cameraZ;

    star.sprite.x =
      star.x * (fov / z) * this.scene.game.config.width +
      this.scene.game.config.width / 2;

    star.sprite.y =
      star.y * (fov / z) * this.scene.game.config.width +
      this.scene.game.config.height / 2;

    // const dxCenter = star.sprite.x - this.scene.game.config.width / 2;
    // const dyCenter = star.sprite.y - this.scene.game.config.height / 2;

    // const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
    const distanceScale = Math.max(0, (2000 - z) / 2000);

    star.sprite.setScale(
      distanceScale * starBaseSize,
      distanceScale * starBaseSize

      /* +
        (distanceScale * speed * starStretch * distanceCenter) /
          this.scene.game.config.width */
    );

    star.sprite.rotation += 0.02;

    // star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
  }

  update(delta) {
    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * (60 / 1000) * 10 * (speed + baseSpeed);

    for (let i = 0; i < starAmount; i++) {
      this.updateSprite(this.stars[i]);
    }
  }
}
