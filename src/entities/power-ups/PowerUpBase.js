import {
  COLLISION_CATEGORIES
} from '../../config/constants';

export default class PowerUpBase extends Phaser.Physics.Matter.Sprite {
  label = 'PowerUp';
  scene = null;

  constructor (scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);
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
    this.body.label = this.label;
  }

  consume(playerBody) {
    this.setCollisionCategory(COLLISION_CATEGORIES.NONE);
    this.applyToPlayer(this.scene.getPlayerFromBody(playerBody));
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

  applyToPlayer() {
    console.warn('Class ' + this.constructor.name + ' needs to override this mofo: PowerUpBase::applyToPlayer');
  }
}
