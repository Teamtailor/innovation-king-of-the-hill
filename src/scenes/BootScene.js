import MainMenuScene from './menu/MainMenuScene';
import GameScene from './GameScene';

class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene'
    });
  }

  preload() {
    var progress = this.add.graphics();

    this.load.on('progress', value => {
      progress.clear();
      progress.fillStyle(0x990000, 1);
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
      this.load.image('avatar' + i, '//robohash.org/' + i + '?size=48x48');
    }

    this.load.image(
      'rikard',
      '//res.cloudinary.com/teamtailor/image/upload/c_thumb,f_auto,h_48,q_auto,w_48/v1579613249/eeld6pvvmqdr62rrm872'
    );

    this.load.image(
      'anders',
      '//res.cloudinary.com/teamtailor/image/upload/c_thumb,f_auto,h_48,q_auto,w_48/v1558438753/vb6clw0qtuip4d42bhxw'
    );

    this.load.image(
      'adrian',
      '//res.cloudinary.com/teamtailor/image/upload/c_thumb,f_auto,h_48,q_auto,w_48/v1582796431/ct7zszureniopzzldgdz'
    );

    this.load.image(
      'ramya',
      '//res.cloudinary.com/teamtailor/c_thumb,f_auto,h_48,q_auto,w_48/v1568805770/ojwnlxauurjdhp3bpby3'
    );

    this.load.image('grass', 'assets/images/grass.jpg');
    this.load.image('star', 'assets/images/star.png');

    // Menu buttons preload
    this.load.image('NewGameButton', '../assets/images/buttons/menu/ng.png');
    this.load.image('ResumeGameButton', '../assets/images/buttons/menu/rg.png');
    this.load.image('RulesButton', '../assets/images/buttons/menu/rs.png');
    this.load.image('ScoreboardButton', '../assets/images/buttons/menu/sb.png');
  }

  create() {
    this.scene.add('MainMenuScene', MainMenuScene);
    this.scene.add('GameScene', GameScene);

    this.scene.start('MainMenuScene');
  }
}

export default BootScene;
