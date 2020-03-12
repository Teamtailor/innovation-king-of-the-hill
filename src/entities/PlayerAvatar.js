export default class PlayerAvatar {
  constructor(scene, image, color) {
    this.scene = scene;
    this.image = image;
    this.color = color;

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

    this.avatarImage = scene.add.image(0, 0, image);
    this.avatarImage.setMask(this.maskShape.createGeometryMask());

    this.targets = [this.maskShape, this.border, this.avatarImage];
  }

  setDepth(depth) {
    this.targets.forEach(e => {
      e.setDepth(depth);
    });
  }

  setTint(color) {
    this.avatarImage.setTint(color);
  }

  setScale(scale) {
    this.targets.forEach(e => {
      e.setScale(scale);
    });
  }

  setRotation(rotation) {
    this.targets.forEach(e => {
      e.setRotation(rotation);
    });
  }

  setPosition(x, y) {
    this.targets.forEach(e => {
      e.setPosition(x, y);
    });
  }

  clone(newScene) {
    return new PlayerAvatar(newScene || this.scene, this.image, this.color);
  }

  destroy() {
    this.targets.forEach(e => {
      e.destroy();
    });
  }
}
