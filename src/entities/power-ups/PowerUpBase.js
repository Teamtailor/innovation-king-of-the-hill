import {
  COLLISION_CATEGORIES
} from '../../config/constants';

export default class PowerUpBase extends Phaser.Physics.Matter.Sprite {
  scene = null;
  timerEvent = null;
  lifeTime = 0;
  id = null;

  constructor (scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);
    this.id = scene.time.now + '' + Phaser.Math.Between(1000000, 9999999);
    this.scene = scene;
    this.scene.add.existing(this);
  }

  init() {
    this.setCollisionCategory(COLLISION_CATEGORIES.POWER_UP);
    this.setCollidesWith(COLLISION_CATEGORIES.POWER_UP | COLLISION_CATEGORIES.PLAYER);
    this.setOnCollide(this.handleCollision.bind(this));
    this.setRandomRotation();
    this.setLabel();
    this.setSensor(true);
    return this;
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
    this.setCollisionCategory(COLLISION_CATEGORIES.NONE);
    this.attachToPlayer(this.scene.getPlayerFromBody(playerBody));
    this.animateConsumation(() => {
      console.log('Animation complete', this);
      this.destroy();
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

    this.timerEvent = this.scene.time.addEvent({
      delay: this.lifeTime,
      callback: this.onTimerEventComplete,
      callbackScope: this,
      args: [player]
    });

    this.onAttachToPlayer(player);
  }

  detachFromPlayer(player) {
    player.removePowerUp(this);
    this.onDetachFromPlayer(player);
  }

  onTimerEventComplete(player) {
    this.detachFromPlayer(player);
  }
}
