import BaseScene from '../BaseScene';
import constants from '../../config/constants';

class MainMenuScene extends BaseScene {
  constructor() {
    super({
      key: 'MainMenuScene'
    });
    this.players = [
      {
        name: 'Adrian Wojdat',
        level: 2
      },
      {
        name: 'Rikard Wissing',
        level: 1
      }
    ];
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

  preload() {}

  create() {
    super.create();
    this.adjustCamera();
    this.scale.on('resize', this.resize, this);

    const buttons = [];

    this.add.image(-110, -50, 'MenuBackground').setOrigin(0).setScale(1.7);

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

    buttons.push(this.add.image(400, 270, 'NewGameButton').setInteractive());
    buttons.push(this.add.image(400, 370, 'ResumeGameButton').setInteractive());
    buttons.push(this.add.image(400, 470, 'RulesButton').setInteractive());
    buttons.push(this.add.image(400, 570, 'ScoreboardButton').setInteractive());

    this.resizeElements(buttons, 280, 90);

    buttons[0].on('pointerdown', this.goToGame.bind(this));
    buttons[1].on('pointerdown', this.goToGame.bind(this));
    buttons[2].on('pointerdown', this.goToRules.bind(this));
    buttons[3].on('pointerdown', this.goToScoreboard.bind(this));
  }

  resizeElements(buttons, width, height) {
    buttons.map(button => button.setDisplaySize(width, height));
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

    this.drawUsersList(5);
  }

  drawUsersList(maxPlayersCount) {
    let printedUsersCount = 0;
    let printStartPositionY = 400;
    const printStartPositionX = 760;
    const tableSpace = 80;
    
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

    this.players.map(player => {
      if (printedUsersCount <= maxPlayersCount) {
        this.add.text(printStartPositionX, printStartPositionY, player.level, {
          fontFamily: 'Pixeled',
          fontSize: 15,
          color: '#ffffff'
        });
        this.add.text(
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
    });
    console.log(this.players);
  }

  goToGame() {
    this.scene.start('GameScene');
  }

  goToRules() {
    console.log('rules');
  }

  goToScoreboard() {
    console.log('scores');
  }
}

export default MainMenuScene;
