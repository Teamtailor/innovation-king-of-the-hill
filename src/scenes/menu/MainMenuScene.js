import GameScene from '../GameScene';

class MainMenuScene extends Phaser.Scene {
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

  preload() {}

  create() {
    const buttons = [];
    const backgroundColor = 0xffffff;

    this.cameras.main.setBackgroundColor(backgroundColor);

    this.drawActiveUsers();

    this.add.text(230, 100, 'Welcome to Teamtailor\'s King of the Hill', {
      fontFamily: 'Arial',
      fontSize: 45,
      color: '#000000'
    });

    buttons.push(this.add.image(380, 270, 'NewGameButton').setInteractive());
    buttons.push(this.add.image(380, 370, 'ResumeGameButton').setInteractive());
    buttons.push(this.add.image(380, 470, 'RulesButton').setInteractive());
    buttons.push(this.add.image(380, 570, 'ScoreboardButton').setInteractive());

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
    const borderRect = new Phaser.Geom.Rectangle(650, 200, 350, 430);
    const activeUsersRect = new Phaser.Geom.Rectangle(652, 202, 346, 426);
    const line = new Phaser.Geom.Line(720, 300, 900, 300);

    const borderGraphics = this.add.graphics({
      fillStyle: {
        color: 0x000000
      }
    });
    const activeUsersGraphics = this.add.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });

    borderGraphics.fillRectShape(borderRect);
    activeUsersGraphics.fillRectShape(activeUsersRect);

    activeUsersGraphics.lineStyle(2, 0x000000);
    activeUsersGraphics.strokeLineShape(line);

    this.add.text(710, 250, 'Players online now', {
      fontFamily: 'Arial',
      fontSize: 25,
      color: '#000000'
    });
  
    this.add.graphics(borderGraphics);
    this.add.graphics(activeUsersGraphics);

    this.drawUsersList(5);
  }

  drawUsersList(maxPlayersCount) {
    let printedUsersCount = 0;
    let printStartPositionY = 400;
    const printStartPositionX = 720;
    const tableSpace = 70;
    
    this.add.text(690, 350, 'Levels', {
      fontFamily: 'Arial',
      fontSize: 25,
      color: '#000000'
    });
    this.add.text(830, 350, 'Players', {
      fontFamily: 'Arial',
      fontSize: 25,
      color: '#000000'
    });

    this.players.map(player => {
      if (printedUsersCount <= maxPlayersCount) {
        this.add.text(printStartPositionX, printStartPositionY, player.level, {
          fontFamily: 'Arial',
          fontSize: 25,
          color: '#000000'
        });
        this.add.text((printStartPositionX + tableSpace), printStartPositionY, player.name, {
          fontFamily: 'Arial',
          fontSize: 25,
          color: '#000000'
        });
        printedUsersCount++;
        printStartPositionY += 40;
      }
    });
    console.log(this.players);
  }
 
  goToGame() {
    this.scene.add('GameScene', GameScene);
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
