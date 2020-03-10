export default class PlayerEntity {
  constructor(scene, {
    image = 'avatar1', color = 0xf43f85, controls
  }) {
    this.scene = scene;
    this.grounds = [];

    this.maskShape = scene.make
      .graphics()
      .fillCircleShape(new Phaser.Geom.Circle(0, 0, 22));

    this.border = scene.add
      .graphics({
        fillStyle: {
          color
        }
      })
      .fillCircleShape(new Phaser.Geom.Circle(0, 0, 24));

    this.matterObj = scene.matter.add.image(
      scene.game.config.width / 2,
      scene.game.config.height / 2,
      image
    );
    this.matterObj.setCircle(24);
    this.matterObj.setDensity(0.005);
    this.matterObj.setFriction(0.2, 0.2);
    this.matterObj.setBounce(1);
    this.matterObj.setMask(this.maskShape.createGeometryMask());

    this.strength = 1;
    this.fatigue = 0;
    this.boosting = false;
    this.chargingBoost = false;

    this.keys = scene.input.keyboard.addKeys(controls);
  }

  getAvailableStrength(delta) {
    return (this.strength * 1 - this.fatigue) * (delta / (1000 / 60));
  }

  readController(delta) {
    const availableStrength = this.getAvailableStrength(delta);

    if (this.fatigue > 0) {
      this.fatigue -= ((delta / (1000 / 60)) * 0.5) / 60;
      if (this.fatigue < 0) this.fatigue = 0;
    }

    if (this.disableController || !availableStrength) {
      return;
    }

    const {
      up = {}, down = {}, left = {}, right = {}, boost = {}
    } = this.keys;

    if (up.isDown) {
      this.matterObj.thrustLeft(0.05 * availableStrength);
    }
    if (down.isDown) {
      this.matterObj.thrustLeft(-0.05 * availableStrength);
    }
    if (left.isDown && !this.boosting) {
      this.matterObj.setAngularVelocity(-0.1 * availableStrength);
    }
    if (right.isDown && !this.boosting) {
      this.matterObj.setAngularVelocity(0.1 * availableStrength);
    }

    if (boost.isDown && !this.boosting) {
      this.chargingBoost = true;
    }
    if (boost.isUp && this.chargingBoost) {
      this.chargingBoost = false;
      this.boosting = true;

      this.scene.tweens.add({
        targets: [this.matterObj, this.maskShape, this.border],
        scale: 1.2,
        ease: 'linear',
        duration: 100,
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          this.boosting = false;
        }
      });

      this.matterObj.thrustLeft(0.5 * availableStrength);
      this.fatigue += this.fatigue < 1 - 0.2 ? 0.2 : 1 - this.fatigue;
    }
  }

  finishBoosting() {
    return new Promise(resolve => {
      if (this.boosting === false) {
        return resolve();
      }

      setInterval(() => {
        if (this.boosting === false) {
          resolve();
        }
      }, 10);
    });
  }

  updateMask() {
    this.border.setPosition(this.matterObj.x, this.matterObj.y);
    this.maskShape.setPosition(this.matterObj.x, this.matterObj.y);
  }

  destroy() {
    this.matterObj.destroy();
    this.border.destroy();
    this.maskShape.destroy();
  }

  die() {
    return new Promise(resolve => {
      this.dying = true;

      this.scene.tweens.add({
        targets: [this.matterObj, this.maskShape, this.border],
        scale: 0,
        angle: 240 * (this.matterObj.body.angularVelocity < 0 ? -1 : 1),
        ease: 'linear',
        duration: 1000,
        yoyo: false,
        repeat: 0,
        onComplete: () => {
          resolve();
        }
      });

      this.matterObj.setCollisionCategory(0);

      this.disableController = true;
    });
  }

  removeFromGround(ground) {
    this.grounds = this.grounds.filter(g => g !== ground);
  }

  addToGround(ground) {
    this.grounds.push(ground);
  }

  isOnAnyGround() {
    return !!this.grounds.length;
  }

  update(time, delta) {
    this.updateMask();
    this.readController(delta);
  }
}
