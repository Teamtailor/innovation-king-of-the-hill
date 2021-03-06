import constants from '../config/constants';

export default class BaseScene extends Phaser.Scene {
  create() {
    this.adjustCamera();
    this.scale.on('resize', this.resize, this);
    this.clickSound = this.sound.add('ClickSound');
  }

  resize(gameSize, baseSize, displaySize, resolution) {
    this.adjustCamera();
  }

  adjustCamera() {
    const {
      cameras, main
    } = this.cameras;

    cameras.forEach(c => {
      const {
        gameSize
      } = c.scaleManager;

      const zoomX = gameSize.width / constants.WIDTH;
      const zoomY = gameSize.height / constants.HEIGHT;
      const zoom = zoomX > zoomY ? zoomY : zoomX;

      c.setZoom(zoom);
    });

    if (main && !this.follow) {
      main.centerOn(constants.WIDTH / 2, constants.HEIGHT / 2);
    }
  }

  followObject(object) {
    if (this.follow === object) {
      return;
    }

    this.stopFollow(this.follow, true);

    this.follow = object;
    this.cameras.main.startFollow(object);

    this.adjustCamera();
  }

  setHover() {
    this.setFrame(1);
  }

  disableHover() {
    this.setFrame(0);
  }

  goToMainMenu() {
    this.clickSound.play();
    this.scene.start('MainMenuScene');
  }

  resizeElements(buttons, width, height) {
    buttons.map(button => button.setDisplaySize(width, height));
  }

  stopFollow(object, skipAdjust) {
    if (object !== this.follow) {
      return;
    }

    if (object === this.follow) {
      this.cameras.main.stopFollow();
      this.follow = undefined;
    }

    if (!skipAdjust) {
      this.adjustCamera();
    }
  }
}
