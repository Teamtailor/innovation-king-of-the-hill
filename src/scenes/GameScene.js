import PlayerEntity from '../entities/PlayerEntity';
import GroundEntity from '../entities/GroundEntity';
import PowerUpService from '../services/PowerUpService';
import constants from '../config/constants';

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene'
    });

    this.powerUpService = new PowerUpService(this);
  }

  preload() {
    this.powerUpService.init();
  }

  resize(gameSize, baseSize, displaySize, resolution) {
    this.adjustCamera();
  }

  adjustCamera() {
    const {
      main
    } = this.cameras;

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
      main.setZoom(zoom * 2);
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

  create() {
    this.adjustCamera();
    this.scale.on('resize', this.resize, this);

    this.ground = new GroundEntity({
      scene: this,
      onCollideCallback: this.enteringGround.bind(this),
      onCollideEndCallback: this.leavingGround.bind(this)
    });

    this.createPlayers();
    this.createInstructions();
  }

  createInstructions() {
    this.add.text(
      10,
      10,
      'Controls:\nPush: Arrows & Space\nTank: WASD & R\nMouse: Click & B',
      {
        fontFamily: 'Arial',
        fontSize: 12,
        color: '#00ff00'
      }
    );
  }

  getRandomGroundPosition() {
    return this.ground.getRandomPosition();
  }

  getPlayerFromBody(body) {
    const [player] = this.players.filter(p => p.matterObj.body === body);
    return player;
  }

  enteringGround({
    bodyA, bodyB
  }) {
    console.log(bodyA, bodyB);
    const player = this.getPlayerFromBody(bodyB);

    if (player) {
      player.addToGround(bodyA);
    }
  }

  async leavingGround({
    bodyA, bodyB
  }) {
    const player = this.getPlayerFromBody(bodyB);
    if (!player) {
      return;
    }
    player.removeFromGround(bodyA);

    await player.finishBoosting();
    if (!player.isOnAnyGround()) {
      this.killPlayer(player);
    }
  }

  async killPlayer(player) {
    await player.die();
    this.players = this.players.filter(p => p !== player);
    player.destroy();
  }

  createPlayers() {
    this.players = [];

    this.players.push(
      new PlayerEntity(this, {
        image: 'rikard',
        color: 0xffffff * Math.random(),
        controls: {
          up: 'up',
          down: 'down',
          left: 'left',
          right: 'right',
          boost: 'space'
        }
      })
    );

    this.players.push(
      new PlayerEntity(this, {
        image: 'anders',
        color: 0xffffff * Math.random(),
        controls: {
          up: 'w',
          left: 'a',
          down: 's',
          right: 'd',
          boost: 'r'
        },
        useTankControls: true
      })
    );

    this.players.push(
      new PlayerEntity(this, {
        image: 'adrian',
        color: 0xffffff * Math.random(),
        controls: {
          boost: 'b'
        },
        useMouse: true
      })
    );

    this.players.push(
      new PlayerEntity(this, {
        image: 'ramya',
        color: 0xffffff * Math.random()
      })
    );

    this.players.push(
      new PlayerEntity(this, {
        color: 0xffffff * Math.random()
      })
    );

    this.players.push(
      new PlayerEntity(this, {
        image: 'avatar2',
        color: 0xffffff * Math.random()
      })
    );
  }

  update(time, delta) {
    this.players.forEach(p => {
      p.update(time, delta);
    });

    this.powerUpService.update(time, delta);
  }
}

export default GameScene;
