import BaseScene from './BaseScene';

class UiScene extends BaseScene {
  players = [];
  playerAvatars = [];
  killTexts = [];
  deathTexts = [];
  assistTexts = [];
  suicideTexts = [];
  pointsTexts = [];
  powerUps = [];

  constructor() {
    super({
      key: 'UiScene'
    });
  }

  preload() {}

  create() {
    super.create();
    this.updateScoreboard();
  }

  updateScoreboard() {
    const distance = 150;
    let x =
      this.game.config.width / 2 -
      ((this.playerAvatars.length - 1) / 2) * distance;
    const y = this.game.config.height - 50;

    this.powerUps.forEach(pU => {
      pU.destroy();
    });

    this.players.forEach((p, i) => {
      const playerAvatar = this.playerAvatars[i];
      const killText = this.killTexts[i];
      const deathText = this.deathTexts[i];
      const assistText = this.assistTexts[i];
      const suicideText = this.suicideTexts[i];
      const pointsText = this.pointsTexts[i];

      playerAvatar.setPosition(x, y);
      killText.setPosition(x + 30, y - 28);
      killText.setText(p.kills);

      deathText.setPosition(x + 30, y);
      deathText.setText(p.murdered);

      assistText.setPosition(x - 30, y - 28);
      assistText.setText(p.assists);

      suicideText.setPosition(x - 30, y);
      suicideText.setText(p.suicides);

      pointsText.setPosition(x, y - 55);
      pointsText.setText(p.getPoints());

      x += distance;
    });
  }

  addPlayerToScoreBoard(player) {
    const playerAvatar = player.playerAvatar.clone(this);
    playerAvatar.setScale(0.1);

    const fontStyle = {
      fontFamily: 'Pixeled',
      fontSize: 12,
      color: '#ffffff'
    };

    const killText = this.add.text(0, 0, '0', fontStyle);
    const deathText = this.add.text(0, 0, '0', fontStyle);
    const assistText = this.add.text(0, 0, '0', fontStyle);
    const suicideText = this.add.text(0, 0, '0', fontStyle);
    const pointsText = this.add.text(0, 0, '0', fontStyle);
    assistText.setOrigin(1, 0);
    suicideText.setOrigin(1, 0);
    pointsText.setOrigin(0.5, 0);

    this.killTexts.push(killText);
    this.deathTexts.push(deathText);
    this.assistTexts.push(assistText);
    this.suicideTexts.push(suicideText);
    this.pointsTexts.push(pointsText);

    this.players.push(player);
    this.playerAvatars.push(playerAvatar);

    this.updateScoreboard();
  }

  update(time, delta) {}
}

export default UiScene;
