import GameScene from '../GameScene';

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'MainMenuScene'
    });
  }

  preload() {}

  create() {
    const buttons = [];

    this.cameras.main.setBackgroundColor('#ffffff');

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
