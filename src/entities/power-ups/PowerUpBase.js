import {
  COLLISION_CATEGORIES,
  POWER_UP_CONFIG,
  DEPTHS
} from '../../config/constants';

export default class PowerUpBase extends Phaser.Physics.Matter.Sprite {
  scene = null;
  effectWornOutTimerEvent = null;
  idleTimerEvent = null;
  effectLifeTime = 0;
  removeAnimation = null;
  consumingAnimation = null;
  id = null;
  shouldDestroy = false;
  isConsumed = false;
  label = null;

  constructor(scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);
    this.id = scene.generateId();
    this.scene = scene;
    this.applyConfig();
  }

  init() {
    this.setCollisionCategory(COLLISION_CATEGORIES.POWER_UP);
    this.setCollidesWith(
      COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND
    );
    this.setOnCollide(this.handleCollision.bind(this));
    this.setRandomRotation();
    this.setLabel();
    this.setSensor(true);
    this.setDepth(DEPTHS.ABOVE_GROUND);
    this.scene.add.existing(this);
    this.addRemoveTimerEvent();
    return this;
  }

  get type() {
    return this.body ? this.body.collisionFilter.category : undefined;
  }

  get isActive() {
    return !this.shouldDestroy && !this.isConsumed && this.body;
  }

  applyConfig() {
    const {
      label, duration, svgScale
    } = POWER_UP_CONFIG.TYPES[
      this.constructor.name
    ];

    this.label = label;
    this.effectLifeTime = duration;
    this.setScale(svgScale);
  }

  addRemoveTimerEvent() {
    this.idleTimerEvent = this.scene.time.addEvent({
      delay: Phaser.Math.Between(POWER_UP_CONFIG.IDLE_TIME_MIN, POWER_UP_CONFIG.IDLE_TIME_MAX),
      callback: this.onTooLongIdleEvent,
      callbackScope: this
    });
  }

  onTooLongIdleEvent() {
    if (this.isConsumed) {
      return;
    }
    console.log('Start idle animation', this);
    this.removeAnimation = this.animateRemove();
  }

  setRandomRotation() {
    this.setRotationFromDegrees(Phaser.Math.Between(0, 360));
  }

  setRotationFromDegrees(degrees) {
    this.setRotation(degrees * (Math.PI / 180));
  }

  setLabel() {
    this.body.label = 'PowerUp::' + this.constructor.name;
  }

  consume(playerBody) {
    const player = this.scene.getPlayerFromBody(playerBody);
    if (!player.isAlive || this.isConsum || this.isConsumed) {
      return;
    }

    this.setCollisionCategory(COLLISION_CATEGORIES.NONE);
    this.attachToPlayer(player);
    this.isConsumed = true;
    this.scene.events.emit('power-up-consumed', this);

    console.log('Consuming power up', {
      player,
      powerUp: this
    });

    this.tidyIdleTasks();
    this.addTextAnimation(this, this.label);
    this.consumingAnimation = this.animateConsumation();
  }

  tidy() {
    if (this.effectWornOutTimerEvent) {
      this.effectWornOutTimerEvent.destroy();
      this.effectWornOutTimerEvent = null;
    }
    this.tidyIdleTasks();
  }

  tidyIdleTasks() {
    if (this.idleTimerEvent) {
      this.idleTimerEvent.destroy();
      this.idleTimerEvent = null;
    }
    if (this.removeAnimation) {
      if (this.removeAnimation.isPlaying()) {
        this.removeAnimation.stop();
      }

      this.removeAnimation.remove();
      this.removeAnimation = null;
    }
  }

  addTextAnimation({
    scene, x, y
  }, text) {
    scene.addTextAnimation({
      x, y
    }, text);
  }

  onAnimateConsumationComplete() {
    console.log('Power up animation complete', this);
    this.destroy();
  }

  animateConsumation() {
    return this.scene.tweens.add({
      targets: [this],
      scale: 2,
      alpha: {
        from: 1,
        to: 0
      },
      angle: Phaser.Math.Between(0, 180),
      ease: 'Cubic',
      duration: 250,
      yoyo: false,
      repeat: 0,
      onComplete: this.onAnimateConsumationComplete.bind(this)
    });
  }

  onAnimateRemoveComplete() {
    console.log('Idle animation complete', this);
    if (!this.isConsumed) {
      this.destroy();
    }
  }

  onAnimateRemoveUpdate({
    progress
  }) {
    if (!this.shouldDestroy && progress > 0.7) {
      this.scene.events.emit('power-up-removed', this);
      this.shouldDestroy = true;
      this.setCollisionCategory(COLLISION_CATEGORIES.NONE);
    }
  }

  animateRemove() {
    return this.scene.tweens.add({
      targets: [this],
      scale: 0,
      ease: 'Cubic',
      duration: 350,
      yoyo: false,
      repeat: 0,
      onComplete: this.onAnimateRemoveComplete.bind(this),
      onUpdate: this.onAnimateRemoveUpdate.bind(this)
    });
  }

  handleCollision({
    bodyA, bodyB
  }) {
    if (bodyA.collisionFilter.category !== COLLISION_CATEGORIES.PLAYER) {
      return;
    }

    this.consume(bodyA);
  }

  attachToPlayer(player) {
    player.addPowerUp(this);

    this.effectWornOutTimerEvent = this.scene.time.addEvent({
      delay: this.effectLifeTime,
      callback: this.onEffecWornOut,
      callbackScope: this,
      args: [player]
    });

    this.onAttachToPlayer(player);
  }

  detachFromPlayer(player) {
    if (!player.isAlive) {
      return;
    }

    player.removePowerUp(this);
    this.onDetachFromPlayer(player);

    console.log('Power up worn out', {
      player,
      powerUp: this
    });
  }

  onEffecWornOut(player) {
    this.detachFromPlayer(player);
  }

  hasPosition() {
    return !!this.body;
  }

  getPosition() {
    return new Phaser.Geom.Point(this.x, this.y);
  }
}
