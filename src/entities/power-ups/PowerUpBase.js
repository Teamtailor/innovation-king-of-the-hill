import {
  COLLISION_CATEGORIES
} from '../../config/constants';

export default class PowerUpBase extends Phaser.Physics.Matter.Sprite {
  scene = null;
  effectWornOutTimerEvent = null;
  idleTimerEvent = null;
  effectLifeTime = 0;
  idleLifetime = 3000;
  id = null;
  isDestroyed = false;
  isConsumed = false;
  label = null;

  constructor (scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);
    this.id = scene.time.now + '' + Phaser.Math.Between(1000000, 9999999);
    this.scene = scene;
  }

  init() {
    this.setCollisionCategory(COLLISION_CATEGORIES.POWER_UP);
    this.setCollidesWith(COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND);
    this.setOnCollide(this.handleCollision.bind(this));
    this.setRandomRotation();
    this.setLabel();
    this.setSensor(true);
    this.scene.add.existing(this);
    this.addRemoveTimerEvent();
    return this;
  }

  addRemoveTimerEvent() {
    this.idleTimerEvent = this.scene.time.addEvent({
      delay: this.idleLifetime,
      callback: this.onTooLongIdleEvent,
      callbackScope: this
    });
  }

  onTooLongIdleEvent() {
    if (this.isConsumed) {
      return;
    }
    console.log('Start idle animation', this);

    this.animateTooLongIdle(() => {
      console.log('Start idle animation complete', this);
      this.isDestroyed = true;
      this.destroy();
    });
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

    this.setCollisionCategory(COLLISION_CATEGORIES.NONE);
    this.attachToPlayer(player);
    this.isConsumed = true;

    console.log('Consuming power up', {
      player, powerUp: this
    });

    if (this.idleTimerEvent) {
      this.idleTimerEvent.destroy();
    }

    this.animateConsumation(() => {
      console.log('Power up animation complete', this);
      this.destroy();
    });
  }

  addTextAnimation() {
    if (this.label === null) {
      return;
    }
    const label = this.scene.add.text(this.x, this.y, this.label, {
      fontFamily: 'Pixeled',
      fontSize: 14,
      color: '#ffbe00'
    });
    label.setOrigin(0.5);
    label.setDepth(1);

    this.scene.tweens.add({
      targets: [label],
      scale: 2.8,
      angle: Math.random() > 0.5 ? 50 : -50,
      ease: 'Cubic',
      duration: 1000,
      yoyo: false,
      repeat: 0,
      onUpdate({
        progress
      }) {
        if (progress > 0.5) {
          label.setAlpha(1 + (0.5 - progress) * 2);
        }
      },
      onComplete: () => {
        label.destroy();
      }
    });
  }

  animateConsumation(onComplete) {
    this.scene.tweens.add({
      targets: [this],
      scale: 2,
      alpha: {
        from: 1, to: 0
      },
      angle: Phaser.Math.Between(0, 180),
      ease: 'Cubic',
      duration: 250,
      yoyo: false,
      repeat: 0,
      onComplete: onComplete
    });
  }

  animateTooLongIdle(onComplete) {
    this.scene.tweens.add({
      targets: [this],
      scale: 0,
      ease: 'Cubic',
      duration: 350,
      yoyo: false,
      repeat: 0,
      onComplete: onComplete
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
    player.removePowerUp(this);
    this.onDetachFromPlayer(player);

    console.log('Power up worn out', {
      player, powerUp: this
    });
  }

  onEffecWornOut(player) {
    this.detachFromPlayer(player);
  }
}
