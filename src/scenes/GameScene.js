import BaseScene from './BaseScene';
import PlayerEntity from '../entities/PlayerEntity';
import AiPlayerEntity from '../entities/AiPlayerEntity';
import GroundEntity from '../entities/GroundEntity';
import StarBackgroundEntity from '../entities/StarBackgroundEntity';
import PowerUpService from '../services/PowerUpService';
import {
  COLLISION_CATEGORIES
} from '../config/constants';

class GameScene extends BaseScene {
  generatedCount = 0;

  constructor() {
    super({
      key: 'GameScene'
    });

    this.powerUpService = new PowerUpService(this);
  }

  preload() {
    this.powerUpService.preload();
  }

  create(level) {
    super.create();

    this.scene.launch('UiScene');

    const escButton = this.input.keyboard.addKey('esc');
    this.adjustCamera();
    this.scale.on('resize', this.resize, this);

    escButton.on('down', this.goToMenu.bind(this));

    if (level.background) {
      if (level.background.type === 'StarBackground') {
        this.background = new StarBackgroundEntity({
          scene: this,
          data: level.background.data
        });
      }
    }

    this.ground = new GroundEntity({
      scene: this,
      onCollideCallback: this.enteringGround.bind(this),
      onCollideEndCallback: this.leavingGround.bind(this),
      level
    });

    this.createPlayers();
    this.powerUpService.start();
  }

  addPlayerToScoreBoard(player) {
    this.scene.get('UiScene').addPlayerToScoreBoard(player);
  }

  updateScoreboard() {
    this.scene.get('UiScene').updateScoreboard();
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
    if (bodyB.collisionFilter.category !== COLLISION_CATEGORIES.PLAYER) {
      return;
    }
    const player = this.getPlayerFromBody(bodyB);
    player.addToGround(bodyA);
  }

  async leavingGround({
    bodyA, bodyB
  }) {
    if (bodyB.collisionFilter.category !== COLLISION_CATEGORIES.PLAYER) {
      return;
    }

    const player = this.getPlayerFromBody(bodyB);
    player.removeFromGround(bodyA);

    await player.finishBoosting();
    if (!player.isOnAnyGround()) {
      await player.fall();
      player.spawn();
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
      new AiPlayerEntity(this, {
        image: 'avatar1',
        color: 0xff00ff
      })
    );

    this.players.push(
      new AiPlayerEntity(this, {
        image: 'avatar2',
        color: 0xff5522
      })
    );

    this.players.push(
      new AiPlayerEntity(this, {
        image: 'avatar3',
        color: 0x00ff99
      })
    );

    this.players.push(
      new AiPlayerEntity(this, {
        image: 'avatar4',
        color: 0x5500aa
      })
    );
  }

  update(time, delta) {
    if (this.background) {
      this.background.update(delta);
    }

    this.players.forEach(p => {
      p.update(time, delta);
    });

    this.powerUpService.update(time, delta);
  }

  generateId() {
    return 'ID__' + parseInt(this.time.now) + '__' + this.generatedCount++;
  }
}

export default GameScene;
