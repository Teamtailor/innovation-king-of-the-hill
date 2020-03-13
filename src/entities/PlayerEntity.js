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
  murdered = 0;
  collisions = 0;
  kills = 0;
  assists = 0;
  suicides = 0;
  points = 0;
  lastCollidedPlayers = [];

  constructor(
    scene,
    {
      image = 'avatar1',
      color = 0xf43f85,
      controls,
      useMouse,
      useTankControls,
      follow,
      autoJump
    }
  ) {
    this.scene = scene;
    this.useMouse = useMouse;
    this.useTankControls = useTankControls;
    this.autoJump = autoJump;
    this.id = scene.generateId();

    this.matterObj = scene.matter.add.image(-1000, -1000, 'transparent', null, {
      label: 'player-' + image,
      shape: {
        type: 'circle',
        radius: 240
      }
    });

    this.createSensors();

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

  edgeSensor = null;
  edgeSensorConstraint = null;
  edgeSensorGrounds = 0;

  jumpSensor = null;
  jumpSensorConstraint = null;
  jumpSensorGrounds = 0;

  createEdgeSensor() {
    this.edgeSensor = this.scene.matter.add.circle(0, 0, 10, {
      isSensor: true,
      collisionFilter: {
        category: COLLISION_CATEGORIES.PLAYER_SENSOR,
        mask: COLLISION_CATEGORIES.GROUND
      },
      density: 0.00000000001
    });

    this.edgeSensor.onCollideCallback = () => {
      this.edgeSensorGrounds += 1;
    };

    this.edgeSensor.onCollideEndCallback = () => {
      this.edgeSensorGrounds -= 1;
      if (!this.edgeSensorGrounds && this.jumpSensorGrounds) {
        this.boostUp();
      }
    };

    this.edgeSensorConstraint = this.scene.matter.add.constraint(
      this.matterObj,
      this.edgeSensor,
      0,
      1
    );
  }

  createJumpSensor() {
    this.jumpSensor = this.scene.matter.add.rectangle(0, 0, 100, 10, {
      isSensor: true,
      collisionFilter: {
        category: COLLISION_CATEGORIES.PLAYER_SENSOR,
        mask: COLLISION_CATEGORIES.GROUND
      },
      density: 0.00000000001
    });

    this.jumpSensor.onCollideCallback = () => {
      this.jumpSensorGrounds += 1;
    };

    this.jumpSensor.onCollideEndCallback = () => {
      this.jumpSensorGrounds -= 1;
    };

    this.jumpSensorConstraint = this.scene.matter.add.constraint(
      this.matterObj,
      this.jumpSensor,
      0,
      1
    );
  }

  createSensors() {
    if (this.autoJump) {
      this.createEdgeSensor();
      this.createJumpSensor();
    }
  }

  get isActive() {
    return this.isAlive;
  }

  onCollideCallback({
    bodyA, bodyB, collision
  }) {
    if (
      bodyB.collisionFilter.category === COLLISION_CATEGORIES.PLAYER &&
      bodyA.collisionFilter.category === COLLISION_CATEGORIES.PLAYER
    ) {
      // collided with another player
      let collidedPlayer = this.scene.getPlayerFromBody(bodyB);
      if (collidedPlayer === this) {
        collidedPlayer = this.scene.getPlayerFromBody(bodyA);
      }

      this.updatePlayerCollision(collidedPlayer, collision);
    }
  }

  updatePlayerCollision(collidedPlayer, collision) {
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
        return force;
      }
    }
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
    return force;
  }

  applyBoost(force, degrees = 0) {
    if (this.boost) {
      const boostVector =
        degrees === 0
          ? new Phaser.Math.Vector2(this.boost, this.boost)
          : Phaser.Physics.Matter.Matter.Vector.rotate(
            new Phaser.Math.Vector2(this.boost, this.boost),
            Phaser.Math.DegToRad(degrees)
          );

      const boostForce = new Phaser.Math.Vector2(force)
        .normalize()
        .multiply(boostVector);

      this.matterObj.applyForce(boostForce);
      this.boost = null;
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
      this.boostUp();
    }
  }

  boostUp() {
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
    this.boost = 0.5 * this.availableStrength;
  }

  readController(delta) {
    if (this.fatigue > 0) {
      this.fatigue -= 0.5 / 60;
      if (this.fatigue < 0) this.fatigue = 0;
    }

    if (this.disableController) {
      return;
    }

    if (this.useMouse) {
      return this.readMouse(delta);
    } else {
      return this.readPushControls(delta);
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

    this.powerUps.forEach(powerUp => powerUp.destroy());
    this.powerUps = [];

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

    this.scene.updateScoreboard();
  }

  updateDeathScores() {
    this.deaths += 1;

    const now = Date.now();
    const assistingPlayers = this.lastCollidedPlayers
      .filter(({
        time
      }) => {
        return now - time < 200;
      })
      .map(({
        player
      }) => player);

    assistingPlayers.reverse();
    const [killingPlayer, assistingPlayer] = assistingPlayers;

    if (killingPlayer) {
      this.murdered += 1;
      killingPlayer.kills += 1;
      const phrases = ['HA!', 'SEE YA!', 'BYE!'];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      this.scene.addTextAnimation(killingPlayer.matterObj, phrase);

      killingPlayer.updatePoints();
    }

    if (assistingPlayer) {
      assistingPlayer.assists += 1;
      this.scene.addTextAnimation(assistingPlayer.matterObj, 'ASSIST');

      assistingPlayer.updatePoints();
    }

    if (!killingPlayer) {
      this.suicides += 1;
      const phrases = ['DAMMIT!', 'NOOO!', 'OOPS!'];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      this.scene.addTextAnimation(this.matterObj, phrase);
    }

    this.updatePoints();

    this.scene.updateScoreboard();
  }

  updatePoints() {
    let points = 0;
    points += this.kills * 2;
    points += this.assists;
    points -= this.deaths;
    this.points = Math.floor(points);
  }

  fall() {
    return new Promise(resolve => {
      this.updateDeathScores();
      this.scene.events.emit('player-dead', this);

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

  rotateSensors() {
    if (!this.jumpSensor) {
      return;
    }

    const velocity = new Phaser.Math.Vector2(this.matterObj.body.velocity);

    if (velocity.length() > 2) {
      const angle = velocity.angle();
      const rotation = Phaser.Physics.Matter.Matter.Vector.rotate(
        {
          x: 1,
          y: 0
        },
        angle
      );

      this.edgeSensorConstraint.pointA = {
        x: rotation.x * 26,
        y: rotation.y * 26
      };

      this.jumpSensorConstraint.pointA = {
        x: rotation.x * 100,
        y: rotation.y * 100
      };

      this.jumpSensor.angle = angle;
    }
  }

  update(time, delta) {
    this.rotateSensors();
    this.updateAvailableStrength(delta);
    this.updateMask();

    this.readBoost();
    const force = this.readController(delta);
    this.applyBoost(force);
  }

  addPowerUp(powerUp) {
    this.powerUps.push(powerUp);
    this.scene.updateScoreboard();
  }

  removePowerUp(powerUp) {
    const index = this.powerUps.findIndex(pu => pu.id === powerUp.id);
    if (index === -1) {
      return;
    }

    this.powerUps.splice(index, 1);
    this.scene.updateScoreboard();
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

  hasPosition() {
    return !!this.matterObj;
  }

  getPosition() {
    return new Phaser.Geom.Point(this.matterObj.x, this.matterObj.y);
  }

  getSpeed() {
    return this.matterObj.body.speed;
  }
}
