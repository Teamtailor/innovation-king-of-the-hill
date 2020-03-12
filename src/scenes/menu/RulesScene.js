import BaseScene from '../BaseScene';

class RulesScene extends BaseScene {
  constructor() {
    super({
      key: 'RulesScene'
    });
  }

  preload() {}

  create() {
    super.create();
    this.add.image(-110, -50, 'MenuBackground').setOrigin(0).setScale(1.7);

    const rulesInfoHolderRect = new Phaser.Geom.Rectangle(232, 202, 796, 426);
    const rulesInfoHolderGraphics = this.add.graphics({
      fillStyle: {
        color: 0x183274,
        alpha: 0.8
      }
    });
    
    rulesInfoHolderGraphics.fillRectShape(rulesInfoHolderRect);
    this.add.graphics(rulesInfoHolderGraphics);

    this.add.text(590, 250, 'Rules', {
      fontFamily: 'Pixeled',
      fontSize: 20,
      color: '#ffffff'
    });

    this.add.text(300, 330, 'Using the mouse, arrow, or keys (w, s, a, d)\nTry to throw your opponent into the abyss.\nCollect upgrades before others catch them.', {
      fontFamily: 'Pixeled',
      fontSize: 18,
      color: '#ffffff'
    });

    this.backToMenuButton = this.add.sprite(630, 530, 'BackToMenuButton', 0).setInteractive({
      cursor: 'pointer'
    });

    this.resizeElements([this.backToMenuButton], 280, 90);

    this.backToMenuButton.on('pointerdown', this.goToMainMenu.bind(this));
    this.backToMenuButton.on('pointerover', this.setHover);
    this.backToMenuButton.on('pointerout', this.disableHover);
  }
}

export default RulesScene;
