import BaseScene from './BaseScene';
import PlayerEntity from '../entities/PlayerEntity';
import GroundEntity from '../entities/GroundEntity';
import StarBackgroundEntity from '../entities/StarBackgroundEntity';
import PowerUpService from '../services/PowerUpService';

class GameScene extends BaseScene {
  constructor() {
    super({
      key: 'GameScene'
    });

    this.powerUpService = new PowerUpService(this);
  }

  preload() {
    this.powerUpService.preload();
  }

  create() {
    super.create();

    const escButton = this.input.keyboard.addKey('esc');
    this.adjustCamera();
    this.scale.on('resize', this.resize, this);

    escButton.on('down', this.goToMenu.bind(this));

    this.stars = new StarBackgroundEntity({
      scene: this
    });

    this.ground = new GroundEntity({
      scene: this,
      onCollideCallback: this.enteringGround.bind(this),
      onCollideEndCallback: this.leavingGround.bind(this)
    });

    this.createPlayers();
    this.createInstructions();
    this.powerUpService.start();
  }

  createInstructions() {
    this.add.text(
      10,
      10,
      'Controls:\nPush: Arrows & Space\nTank: WASD & R\nMouse: Click & B\nGo to menu: Esc',
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

  goToMenu() {
    this.scene.start('MainMenuScene');
  }

  enteringGround({
    bodyA, bodyB
  }) {
    console.log(bodyA, bodyB);
    const player = this.getPlayerFromBody(bodyB);

    player.addToGround(bodyA);
  }

  async leavingGround({
    bodyA, bodyB
  }) {
    const player = this.getPlayerFromBody(bodyB);
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
  }

  update(time, delta) {
    this.stars.update(delta);

    this.players.forEach(p => {
      p.update(time, delta);
    });

    this.powerUpService.update(time, delta);
  }
}

export default GameScene;
