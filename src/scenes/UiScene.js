import BaseScene from './BaseScene';

class UiScene extends BaseScene {
  constructor() {
    super({
      key: 'UiScene'
    });
  }

  preload() {}

  create() {
    super.create();
    this.createInstructions();
  }

  createInstructions() {
    this.add.text(
      10,
      10,
      'Controls:\nPush: Arrows & Space\nTank: WASD & R\nMouse: Click & B\nGo to menu: Esc',
      {
        fontFamily: 'Pixeled',
        fontSize: 12,
        color: '#00ff00'
      }
    );
  }

  update(time, delta) {}
}

export default UiScene;
