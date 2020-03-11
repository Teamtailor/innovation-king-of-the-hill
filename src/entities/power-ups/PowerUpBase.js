
export default class PowerUpBase extends Phaser.Physics.Matter.Sprite {
  constructor (scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);
    scene.add.existing(this);
  }

  setRandomRotation() {
    this.setRotationFromDegrees(Phaser.Math.Between(0, 360));
  }

  setRotationFromDegrees(degrees) {
    this.setRotation(degrees * (Math.PI / 180));
  }
}
