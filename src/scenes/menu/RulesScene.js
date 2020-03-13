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
    this.add
      .image(-300, 0, 'MenuBackground')
      .setOrigin(0)
      .setScale(0.5);

    const rulesInfoHolderRect = new Phaser.Geom.Rectangle(232, 302, 796, 426);
    const rulesInfoHolderGraphics = this.add.graphics({
      fillStyle: {
        color: 0x872268,
        alpha: 0.9
      }
    });
    
    rulesInfoHolderGraphics.fillRectShape(rulesInfoHolderRect);
    this.add.graphics(rulesInfoHolderGraphics);

    this.add.text(590, 350, 'Rules', {
      fontFamily: 'LatoBold',
      fontSize: 40,
      color: '#ffffff'
    });

    this.add.text(300, 430, 'Using the mouse, arrow, or keys (w, s, a, d)\nTry to throw your opponent into the abyss.\nCollect upgrades before others catch them.', {
      fontFamily: 'LatoBold',
      fontSize: 35,
      color: '#ffffff'
    });

    this.backToMenuButton = this.add.sprite(630, 630, 'BackToMenuButton', 0).setInteractive({
      cursor: 'pointer'
    });

    this.resizeElements([this.backToMenuButton], 280, 90);

    this.backToMenuButton.on('pointerdown', this.goToMainMenu.bind(this));
    this.backToMenuButton.on('pointerover', this.setHover);
    this.backToMenuButton.on('pointerout', this.disableHover);
  }
}

export default RulesScene;
