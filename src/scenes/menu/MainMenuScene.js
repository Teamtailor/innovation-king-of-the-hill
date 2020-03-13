import BaseScene from '../BaseScene';
import {
  LEVELS
} from '../../config/constants';

class MainMenuScene extends BaseScene {
  constructor() {
    super({
      key: 'MainMenuScene'
    });
    this.playersList = [];
    this.socket = window.SocketIO;
    const urlString = window.location.href;
    const url = new URL(urlString);
    this.user = {
      name: url.searchParams.get('user'),
      level: url.searchParams.get('level'),
      avatar: url.searchParams.get('avatar'),
      position: {
        x: 0,
        y: 0
      }
    };
  }

  preload() {}

  create() {
    super.create();
    const buttons = [];

    this.add
      .image(-110, -50, 'MenuBackground')
      .setOrigin(0)
      .setScale(1.7);

    this.drawActiveUsers();

    const menuHolderRect = new Phaser.Geom.Rectangle(232, 202, 346, 426);
    const menuHolderGraphics = this.add.graphics({
      fillStyle: {
        color: 0xffffff,
        alpha: 0.8
      }
    });

    menuHolderGraphics.fillRectShape(menuHolderRect);
    this.add.graphics(menuHolderGraphics);

    buttons.push(
      this.add.sprite(400, 270, 'NewGameButton', 0).setInteractive({
        cursor: 'pointer'
      })
    );
    buttons.push(
      this.add.sprite(400, 370, 'ResumeGameButton', 0).setInteractive({
        cursor: 'pointer'
      })
    );
    buttons.push(
      this.add.sprite(400, 470, 'RulesButton', 0).setInteractive({
        cursor: 'pointer'
      })
    );
    buttons.push(
      this.add.sprite(400, 570, 'ScoreboardButton', 0).setInteractive({
        cursor: 'pointer'
      })
    );

    this.resizeElements(buttons, 280, 90);

    buttons[0].on('pointerdown', this.goToGame.bind(this));
    buttons[1].on('pointerdown', this.goToGame.bind(this));
    buttons[2].on('pointerdown', this.goToRules.bind(this));
    buttons[3].on('pointerdown', this.goToScoreboard.bind(this));

    buttons[0].on('pointerover', this.setHover);
    buttons[1].on('pointerover', this.setHover);
    buttons[2].on('pointerover', this.setHover);
    buttons[3].on('pointerover', this.setHover);

    buttons[0].on('pointerout', this.disableHover);
    buttons[1].on('pointerout', this.disableHover);
    buttons[2].on('pointerout', this.disableHover);
    buttons[3].on('pointerout', this.disableHover);

    this.listenToSocket();
  }

  listenToSocket() {
    this.user.id = this.uuidv4();
    this.user.order = this.getRandomInt(10000);

    this.socket.emit('register', this.user);

    this.socket.on('activeUsers', (players) => {
      players = players.sort((a, b) => (a.order > b.order) ? 1 : -1);
      this.drawUsersList(5, players);
    });

    this.socket.on('reportActive', (msg) => {
      this.socket.emit('present', this.user);
    });
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0; const
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  drawActiveUsers() {
    const activeUsersRect = new Phaser.Geom.Rectangle(682, 202, 346, 426);
    const line = new Phaser.Geom.Line(760, 300, 950, 300);

    const activeUsersGraphics = this.add.graphics({
      fillStyle: {
        color: 0x183274,
        alpha: 0.8
      }
    });

    activeUsersGraphics.fillRectShape(activeUsersRect);

    activeUsersGraphics.lineStyle(2, 0xffffff);
    activeUsersGraphics.strokeLineShape(line);

    this.add.text(750, 250, 'Players online now', {
      fontFamily: 'Pixeled',
      fontSize: 14,
      color: '#ffffff'
    });

    this.add.graphics(activeUsersGraphics);
  }

  drawUsersList(maxPlayersCount, players) {
    let printedUsersCount = 0;
    let printStartPositionY = 400;
    const printStartPositionX = 760;
    const tableSpace = 150;
    
    this.clearPlayersList();

    this.add.text(730, 350, 'Levels', {
      fontFamily: 'Pixeled',
      fontSize: 15,
      color: '#ffffff'
    });
    this.add.text(880, 350, 'Players', {
      fontFamily: 'Pixeled',
      fontSize: 15,
      color: '#ffffff'
    });

    players.map(player => {
      const playerElement = {};
      if (printedUsersCount < maxPlayersCount) {
        playerElement.level = this.add.text(printStartPositionX, printStartPositionY, player.level, {
          fontFamily: 'Pixeled',
          fontSize: 15,
          color: '#ffffff'
        });
        playerElement.name = this.add.text(
          printStartPositionX + tableSpace,
          printStartPositionY,
          player.name,
          {
            fontFamily: 'Pixeled',
            fontSize: 15,
            color: '#ffffff'
          }
        );
        printedUsersCount++;
        printStartPositionY += 40;
      }
      this.playersList.push(playerElement);
    });
  }

  clearPlayersList() {
    this.playersList.map(player => {
      player.level.destroy();
      player.name.destroy();
    });
    this.playersList = [];
  }

  goToGame() {
    this.clickSound.play();
    this.scene.start('GameScene', LEVELS.crazy);
  }

  goToRules() {
    this.clickSound.play();
    this.scene.start('RulesScene');
  }

  goToScoreboard() {
    this.clickSound.play();
    console.log('scores');
  }
}

export default MainMenuScene;
