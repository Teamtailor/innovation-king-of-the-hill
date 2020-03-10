import PlayerEntity from '../entities/PlayerEntity';
import GroundEntity from '../entities/GroundEntity';

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene'
    });
  }

  preload() {}

  create() {
    const ground = new GroundEntity();
    const poly = this.add.polygon(
      this.game.config.width / 2,
      this.game.config.height / 2,
      ground.getPath(),
      0xff0000
    );

    this.matter.add.gameObject(poly, {
      shape: {
        type: 'fromVerts',
        verts: ground.getPath()
      },
      isStatic: true,
      isSensor: true,
      label: 'ground',
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

  getPlayerFromBody(body) {
    const [player] = this.players.filter(p => p.matterObj.body === body);
    return player;
  }

  enteringGround({
    bodyA, bodyB
  }) {
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
  }
}

export default GameScene;
