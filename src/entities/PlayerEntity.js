import {
  COLLISION_CATEGORIES, GAME_CONFIG, DEPTHS
} from '../config/constants';
import PlayerAvatar from './PlayerAvatar';

export default class PlayerEntity {
  powerUps = [];
  grounds = [];
  useMouse = false;
  useTankControls = false;
  speedModifier = 1;
  isAlive = true;
  startScale = 0.1; // workaround to get higher res images
  startRestitution = 4;
  startDensity = 0.005;
  startFriction = 0.2;
  growthModifier = 0;
  id = null;
  deaths = 0;
  collisions = 0;
  kills = 0;
  assists = 0;
  suicides = 0;
  lastCollidedPlayers = [];

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
    this.useMouse = useMouse;
    this.useTankControls = useTankControls;
    this.id = scene.generateId();

    this.matterObj = scene.matter.add.image(-1000, -1000, 'transparent', null, {
      label: 'player-' + image,
      shape: {
        type: 'circle',
        radius: 240
      }
    });

    this.matterObj.setCollisionCategory(COLLISION_CATEGORIES.PLAYER);
    this.matterObj.setCollidesWith(0); // nothing until we have spawned

    this.matterObj.setOnCollide(this.onCollideCallback.bind(this));

    this.playerAvatar = new PlayerAvatar(scene, image, color);
    this.scene.addPlayerToScoreBoard(this);

    this.keys = scene.input.keyboard.addKeys(controls);

    this.spawn();

    if (follow) {
      scene.followObject(this.matterObj);
    }
  }

  onCollideCallback({
    bodyB
  }) {
    if (bodyB.collisionFilter.category === COLLISION_CATEGORIES.PLAYER) {
      // collided with another player
      const collidedPlayer = this.scene.getPlayerFromBody(bodyB);

      this.lastCollidedPlayers = this.lastCollidedPlayers.filter(
        ({
          player
        }) => player !== collidedPlayer
      );

      this.lastCollidedPlayers.push({
        player: collidedPlayer,
        time: Date.now()
      });

      collidedPlayer.collisions += 1;
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
              this.applySpeedModifiers(GAME_CONFIG.DEFAULT_SPEED),
              this.applySpeedModifiers(GAME_CONFIG.DEFAULT_SPEED)
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
      thrust += this.applySpeedModifiers(GAME_CONFIG.DEFAULT_SPEED);
    }
    if (down.isDown) {
      thrust += this.applySpeedModifiers(-GAME_CONFIG.DEFAULT_SPEED);
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
      force.add(
        new Phaser.Math.Vector2(
          0.0,
          this.applySpeedModifiers(-GAME_CONFIG.DEFAULT_SPEED)
        )
      );
    }
    if (down.isDown) {
      force.add(
        new Phaser.Math.Vector2(
          0.0,
          this.applySpeedModifiers(GAME_CONFIG.DEFAULT_SPEED)
        )
      );
    }
    if (left.isDown) {
      force.add(
        new Phaser.Math.Vector2(
          this.applySpeedModifiers(-GAME_CONFIG.DEFAULT_SPEED),
          0
        )
      );
    }
    if (right.isDown) {
      force.add(
        new Phaser.Math.Vector2(
          this.applySpeedModifiers(GAME_CONFIG.DEFAULT_SPEED),
          0
        )
      );
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
        targets: this.playerAvatar.targets,
        scale: (this.startScale + this.startScale * this.growthModifier) * 1.4,
        ease: 'linear',
        duration: 100,
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          this.boosting = false;

          this.playerAvatar.setScale(
            this.startScale + this.startScale * this.growthModifier
          );
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
    return (
      value *
      this.availableStrength *
      this.speedModifier *
      (this.reverseControls ? -1 : 1)
    );
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
    this.playerAvatar.setRotation(this.matterObj.rotation);
    this.playerAvatar.setPosition(this.matterObj.x, this.matterObj.y);
  }

  destroy() {
    this.matterObj.destroy();
    this.playerAvatar.destroy();
    this.powerUps.forEach(powerUp => powerUp.destroy());
    this.powerUps = [];
  }

  spawn() {
    this.isAlive = true;
    this.disableController = false;
    this.strength = 1;
    this.fatigue = 0;
    this.boosting = false;
    this.chargingBoost = false;
    this.reverseControls = false;
    this.speedModifier = 1;
    this.growthModifier = 0;

    this.matterObj.setFrictionAir(this.startFriction);
    this.matterObj.setBounce(this.startRestitution);
    this.matterObj.setDensity(this.startDensity);

    this.matterObj.setRotation(0);

    this.matterObj.setCollisionCategory(COLLISION_CATEGORIES.PLAYER);
    this.matterObj.setCollidesWith(
      COLLISION_CATEGORIES.POWER_UP |
        COLLISION_CATEGORIES.PLAYER |
        COLLISION_CATEGORIES.GROUND
    );

    this.matterObj.setScale(this.startScale);
    this.playerAvatar.setScale(this.startScale);
    this.playerAvatar.setDepth(DEPTHS.ABOVE_GROUND);

    const groundPosition = this.scene.getRandomGroundPosition();
    this.matterObj.setPosition(groundPosition.x, groundPosition.y);
  }

  fall() {
    return new Promise(resolve => {
      this.isAlive = false;
      this.playerAvatar.setDepth(DEPTHS.UNDER_GROUND);

      this.scene.tweens.add({
        targets: this.playerAvatar.targets,
        scale: 0,
        ease: 'linear',
        duration: 1000,
        yoyo: false,
        repeat: 0,
        onComplete: () => {
          setTimeout(() => {
            this.deaths += 1;

            const now = Date.now();
            const assistingPlayers = this.lastCollidedPlayers
              .filter(({
                time
              }) => {
                return now - time < 4000;
              })
              .map(({
                player
              }) => player);

            assistingPlayers.forEach(p => {
              p.assists += 1;
            });

            const [killingPlayer] = assistingPlayers;
            if (killingPlayer) {
              killingPlayer.kills += 1;
            } else {
              this.suicides += 1;
            }

            this.scene.updateScoreboard();
            resolve();
          }, 1000);
        }
      });

      this.scene.tweens.add({
        targets: [this.matterObj],
        angle: 240 * (this.matterObj.body.angularVelocity < 0 ? -1 : 1),
        ease: 'linear',
        duration: 1000,
        yoyo: false,
        repeat: 0
      });

      this.matterObj.setCollidesWith(0);
      this.disableController = true;
      this.powerUps.forEach(powerUp => powerUp.tidy());
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
      body
    } = this.matterObj;
    this.growthModifier += scaleModifier * sign;
    const newScale = this.startScale + this.startScale * this.growthModifier;

    this.matterObj.setDensity(body.density + densityModifier * sign);
    this.matterObj.setScale(newScale);
    this.playerAvatar.setScale(newScale);
    this.strength += strengthModifier * sign;
  }

  speedUp(value) {
    this.speedModifier += value;
  }

  slowDown(value) {
    this.speedModifier -= value;
  }

  slip(slipAmount) {
    const {
      friction
    } = this.matterObj.body;
    this.matterObj.setFrictionAir(friction - slipAmount);
  }

  unslip(slipAmount) {
    const {
      friction
    } = this.matterObj.body;
    this.matterObj.setFrictionAir(friction + slipAmount);
  }

  setReversedControls(value) {
    this.reverseControls = value;
  }

  getPosition() {
    return new Phaser.Geom.Point(this.matterObj.x, this.matterObj.y);
  }

  getSpeed() {
    return this.matterObj.body.speed;
  }
}
