import {
  COLLISION_CATEGORIES
} from '../config/constants';

export default class PlayerEntity {
  powerUps = [];
  speedModifier = 1;

  constructor(
    scene,
    {
      image = 'avatar1',
      color = 0xf43f85,
      controls,
      useMouse,
      useTankControls,
      follow
    }
  ) {
    this.scene = scene;
    this.grounds = [];
    this.useMouse = useMouse;
    this.useTankControls = useTankControls;

    this.maskShape = scene.make
      .graphics()
      .fillCircleShape(new Phaser.Geom.Circle(0, 0, 220));

    this.border = scene.add
      .graphics({
        fillStyle: {
          color
        }
      })
      .fillCircleShape(new Phaser.Geom.Circle(0, 0, 240));

    this.matterObj = scene.matter.add.image(
      scene.game.config.width / 2,
      scene.game.config.height / 2,
      image,
      null,
      {
        label: 'player-' + image,
        shape: {
          type: 'circle',
          radius: 240
        },
        frictionAir: 0.2,
        restitution: 4,
        density: 0.005
      }
    );
    this.matterObj.setCollisionCategory(COLLISION_CATEGORIES.PLAYER);
    this.matterObj.setCollidesWith(
      COLLISION_CATEGORIES.POWER_UP |
        COLLISION_CATEGORIES.PLAYER |
        COLLISION_CATEGORIES.GROUND
    );
    this.matterObj.setMask(this.maskShape.createGeometryMask());

    // workaround to get higher res images
    this.startScale = 0.1;
    this.matterObj.setScale(this.startScale);
    this.maskShape.setScale(this.startScale);
    this.border.setScale(this.startScale);

    this.strength = 1;
    this.fatigue = 0;
    this.boosting = false;
    this.chargingBoost = false;

    this.keys = scene.input.keyboard.addKeys(controls);

    if (follow) {
      scene.followObject(this.matterObj);
    }
  }

  updateAvailableStrength(delta) {
    this.availableStrength = this.strength - this.fatigue;
  }

  readMouse(delta, boost) {
    const {
      buttons, worldX, worldY
    } = this.scene.input.activePointer;

    if (buttons === 1) {
      const relPos = new Phaser.Math.Vector2(worldX, worldY).subtract(
        new Phaser.Math.Vector2(this.matterObj.x, this.matterObj.y)
      );

      const distance = relPos.distance(new Phaser.Math.Vector2(0, 0));

      if (distance > 10) {
        const force = new Phaser.Math.Vector2(relPos)
          .normalize()
          .multiply(
            new Phaser.Math.Vector2(
              this.applySpeedModifiers(0.05),
              this.applySpeedModifiers(0.05)
            )
          );

        this.matterObj.applyForce(force);

        if (boost) {
          const boostForce = new Phaser.Math.Vector2(force)
            .normalize()
            .multiply(new Phaser.Math.Vector2(boost, boost));

          this.matterObj.applyForce(boostForce);
        }
      }
    }
  }

  readTankControls(delta, boost) {
    const {
      up = {}, down = {}, left = {}, right = {}
    } = this.keys;

    let thrust = 0;

    if (up.isDown) {
      thrust += this.applySpeedModifiers(0.05);
    }
    if (down.isDown) {
      thrust += this.applySpeedModifiers(-0.05);
    }
    if (left.isDown && !this.boosting) {
      this.matterObj.setAngularVelocity(-0.1);
    }
    if (right.isDown && !this.boosting) {
      this.matterObj.setAngularVelocity(0.1);
    }

    if (boost) {
      if (up.isDown) {
        thrust += boost;
      }
      if (down.isDown) {
        thrust += -boost;
      }
    }

    this.matterObj.thrustLeft(thrust);
  }

  readPushControls(delta, boost) {
    const {
      up = {}, down = {}, left = {}, right = {}
    } = this.keys;

    const force = new Phaser.Math.Vector2(0, 0);

    if (up.isDown) {
      force.add(new Phaser.Math.Vector2(0.0, this.applySpeedModifiers(-0.05)));
    }
    if (down.isDown) {
      force.add(new Phaser.Math.Vector2(0.0, this.applySpeedModifiers(0.05)));
    }
    if (left.isDown) {
      force.add(new Phaser.Math.Vector2(this.applySpeedModifiers(-0.05), 0));
    }
    if (right.isDown) {
      force.add(new Phaser.Math.Vector2(this.applySpeedModifiers(0.05), 0));
    }

    this.matterObj.applyForce(force);

    if (boost) {
      const boostForce = new Phaser.Math.Vector2(force)
        .normalize()
        .multiply(new Phaser.Math.Vector2(boost, boost));

      this.matterObj.applyForce(boostForce);
    }
  }

  readBoost(delta) {
    const {
      boost = {}
    } = this.keys;

    if (boost.isDown && !this.boosting) {
      this.chargingBoost = true;
    }
    if (boost.isUp && this.chargingBoost) {
      this.chargingBoost = false;
      this.boosting = true;

      this.scene.tweens.add({
        targets: [this.matterObj, this.maskShape, this.border],
        scale: this.maskShape.scale * 1.4,
        ease: 'linear',
        duration: 100,
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          this.boosting = false;
        }
      });

      this.fatigue += this.fatigue < 1 - 0.2 ? 0.2 : 1 - this.fatigue;
      return 0.5 * this.availableStrength;
    }

    return 0;
  }

  readController(delta) {
    if (this.fatigue > 0) {
      this.fatigue -= 0.5 / 60;
      if (this.fatigue < 0) this.fatigue = 0;
    }

    if (this.disableController) {
      return;
    }

    const boost = this.readBoost(delta);

    if (this.useMouse) {
      this.readMouse(delta, boost);
    } else if (this.useTankControls) {
      this.readTankControls(delta, boost);
    } else {
      this.readPushControls(delta, boost);
    }
  }

  applySpeedModifiers(value) {
    return value * this.availableStrength * this.speedModifier;
  }

  finishBoosting() {
    return new Promise(resolve => {
      if (this.boosting === false) {
        return resolve();
      }

      const interval = setInterval(() => {
        if (this.boosting === false) {
          clearInterval(interval);
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
    this.powerUps.forEach(powerUp => powerUp.destroy());
    this.powerUps = [];
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
          this.scene.stopFollow(this.matterObj);
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
    this.updateAvailableStrength(delta);
    this.updateMask();
    this.readController(delta);
  }

  addPowerUp(powerUp) {
    this.powerUps.push(powerUp);
  }

  removePowerUp(powerUp) {
    const index = this.powerUps.findIndex(pu => pu.id === powerUp.id);
    if (index > -1) {
      return;
    }
    this.powerUps.splice(index, 1);
  }

  grow(sizeModifiers) {
    this.changeSize(sizeModifiers, 1);
  }

  shrink(sizeModifiers) {
    this.changeSize(sizeModifiers, -1);
  }

  changeSize({
    strengthModifier, scaleModifier, densityModifier
  }, sign = 1) {
    const {
      body, scale
    } = this.matterObj;
    const newScale = scale + this.startScale * scaleModifier * sign;

    this.matterObj.setDensity(body.density + densityModifier * sign);
    this.maskShape.setScale(newScale);
    this.matterObj.setScale(newScale);
    this.border.setScale(newScale);
    this.strength += strengthModifier * sign;
  }

  speedUp(value) {
    this.speedModifier += value;
  }

  slowDown(value) {
    this.speedModifier -= value;
  }
}
