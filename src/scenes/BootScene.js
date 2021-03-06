import MainMenuScene from './menu/MainMenuScene';
import RulesScene from './menu/RulesScene';
import GameScene from './GameScene';
import UiScene from './UiScene';
import {
  LEVELS
} from '../config/constants';

class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene'
    });
  }

  preload() {
    var progress = this.add.graphics();
    this.cameras.main.setBackgroundColor(0x183274);

    this.load.on('progress', value => {
      progress.clear();
      progress.fillStyle(0xf43f85, 1);
      progress.fillRect(
        0,
        this.sys.game.config.width / 2 - 60,
        this.sys.game.config.width * value,
        60
      );
    });

    this.load.on('complete', function() {
      progress.destroy();
    });

    for (var i = 0; i < 10; i++) {
      this.load.image('avatar' + i, '//robohash.org/' + i + '?size=480x480');
    }

    this.load.image(
      'rikard',
      '//res.cloudinary.com/teamtailor/image/upload/c_thumb,f_auto,h_480,q_auto,w_480/v1579613249/eeld6pvvmqdr62rrm872'
    );

    this.load.image(
      'anders',
      '//res.cloudinary.com/teamtailor/image/upload/c_thumb,f_auto,h_480,q_auto,w_480/v1558438753/vb6clw0qtuip4d42bhxw'
    );

    this.load.image(
      'adrian',
      '//res.cloudinary.com/teamtailor/image/upload/c_thumb,f_auto,h_480,q_auto,w_480/v1582796431/ct7zszureniopzzldgdz'
    );

    this.load.image(
      'ramya',
      '//res.cloudinary.com/teamtailor/c_thumb,f_auto,h_480,q_auto,w_480/v1568805770/ojwnlxauurjdhp3bpby3'
    );

    this.load.image('transparent', 'assets/images/transparent.png');
    this.load.image('star', 'assets/images/star.png');
    this.load.svg('crown', 'assets/svg/crown.svg');

    this.load.json('shapes', 'assets/shapes.json');
    this.load.image('level', 'assets/level.png');

    // Menu buttons preload
    this.load.spritesheet(
      'NewGameButton',
      'assets/images/buttons/menu/ng.png',
      {
        frameWidth: 954,
        frameHeight: 416
      }
    );
    this.load.spritesheet(
      'ResumeGameButton',
      'assets/images/buttons/menu/rg.png',
      {
        frameWidth: 954,
        frameHeight: 416
      }
    );
    this.load.spritesheet('RulesButton', 'assets/images/buttons/menu/rs.png', {
      frameWidth: 954,
      frameHeight: 416
    });
    this.load.spritesheet(
      'ScoreboardButton',
      'assets/images/buttons/menu/sb.png',
      {
        frameWidth: 954,
        frameHeight: 416
      }
    );
    this.load.spritesheet(
      'BackToMenuButton',
      'assets/images/buttons/menu/btm.png',
      {
        frameWidth: 830,
        frameHeight: 318
      }
    );

    this.load.image('MenuBackground', 'assets/images/background.png');

    // Sounds
    this.load.audio('ClickSound', 'assets/sounds/click.mp3');
    this.load.audio('battlemusic', 'assets/sounds/kingofthehill.mp3');
  }

  create() {
    this.scene.add('MainMenuScene', MainMenuScene);
    this.scene.add('RulesScene', RulesScene);
    this.scene.add('GameScene', GameScene);
    this.scene.add('UiScene', UiScene);

    this.scene.start('GameScene', LEVELS.crazy);
  }
}

export default BootScene;
