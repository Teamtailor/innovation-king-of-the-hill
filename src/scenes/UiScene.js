import BaseScene from './BaseScene';

class UiScene extends BaseScene {
  players = [];
  playerAvatars = [];
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
      const deathText = this.deathTexts[i];

      playerAvatar.setPosition(x, y);
      deathText.setPosition(x + 30, y);
      deathText.setText(p.deaths);

      x += distance;
    });
  }

  addPlayerToScoreBoard(player) {
    const playerAvatar = player.playerAvatar.clone(this);
    playerAvatar.setScale(0.1);

    const deathText = this.add.text(0, 0, '0', {
      fontFamily: 'Pixeled',
      fontSize: 12,
      color: '#ffffff'
    });

    this.deathTexts.push(deathText);
    this.players.push(player);
    this.playerAvatars.push(playerAvatar);

    this.updateScoreboard();
  }

  update(time, delta) {}
}

export default UiScene;
