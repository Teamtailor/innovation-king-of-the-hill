import BaseScene from './BaseScene';

class UiScene extends BaseScene {
  players = [];
  playerAvatars = [];
  killTexts = [];
  deathTexts = [];

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

    this.players.forEach((p, i) => {
      const playerAvatar = this.playerAvatars[i];
      const killText = this.killTexts[i];
      const deathText = this.deathTexts[i];

      playerAvatar.setPosition(x, y);
      killText.setPosition(x + 30, y - 28);
      killText.setText(p.kills);
      deathText.setPosition(x + 30, y);
      deathText.setText(p.deaths);

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

    this.killTexts.push(killText);
    this.deathTexts.push(deathText);
    this.players.push(player);
    this.playerAvatars.push(playerAvatar);

    this.updateScoreboard();
  }

  update(time, delta) {}
}

export default UiScene;
