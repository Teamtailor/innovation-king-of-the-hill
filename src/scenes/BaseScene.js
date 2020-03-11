import constants from '../config/constants';

export default class BaseScene extends Phaser.Scene {
  create() {
    this.adjustCamera();
    this.scale.on('resize', this.resize, this);
  }

  resize(gameSize, baseSize, displaySize, resolution) {
    this.adjustCamera();
  }

  adjustCamera() {
    const {
      main
    } = this.cameras;

    if (!main) {
      return;
    }

    const {
      gameSize
    } = main.scaleManager;

    const zoomX = gameSize.width / constants.WIDTH;
    const zoomY = gameSize.height / constants.HEIGHT;
    const zoom = zoomX > zoomY ? zoomY : zoomX;

    if (!this.follow) {
      main.setZoom(zoom);
      main.centerOn(constants.WIDTH / 2, constants.HEIGHT / 2);
    } else {
      main.setZoom(zoom);
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
