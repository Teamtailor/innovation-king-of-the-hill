import BaseScene from './BaseScene';
import GroundEntity from '../entities/GroundEntity';
import StarBackgroundEntity from '../entities/StarBackgroundEntity';
import PowerUpService from '../services/PowerUpService';
import {
  COLLISION_CATEGORIES, DEPTHS
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
    this.players = [];

    this.scene.launch('UiScene', this);

    this.battleMusic = this.sound.add('battlemusic');
    this.battleMusic.play({
      loop: true
    });

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
  }

  addPlayerToScoreBoard(player) {
    this.scene.get('UiScene').addPlayerToScoreBoard(player);
  }

  updateScoreboard() {
    this.scene.get('UiScene').updateScoreboard();
  }

  getRandomGroundPosition(continent) {
    return this.ground.getRandomPosition(continent);
  }

  getPlayerFromBody(body) {
    const [player] = this.players.filter(p => p.matterObj.body === body);
    return player;
  }

  addTextAnimation({
    x, y
  }, text) {
    if (!text) {
      return;
    }
    let label = this.add.text(x, y, text, {
      fontFamily: 'LatoBold',
      fontSize: 20,
      color: '#ffbe00'
    });
    label.setOrigin(0.5);
    label.setDepth(DEPTHS.AIR);

    this.tweens.add({
      targets: [label],
      scale: 2.8,
      angle: Math.random() > 0.5 ? 50 : -50,
      ease: 'Cubic',
      duration: 1000,
      yoyo: false,
      repeat: 0,
      onUpdate({
        progress
      }) {
        if (progress > 0.5) {
          label.setAlpha(1 + (0.5 - progress) * 2);
        }
      },
      onComplete: () => {
        label.destroy();
        label = null;
      }
    });
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
