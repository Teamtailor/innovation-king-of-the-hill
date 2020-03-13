import BaseScene from './BaseScene';
import PressToJoin from '../entities/PressToJoin';

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

  create(gameScene) {
    this.gameScene = gameScene;

    super.create();
    this.crown = this.add.image(0, 0, 'crown');
    this.crown.setScale(0.2);
    this.crown.setRotation((18 * Math.PI) / 180);
    this.created = true;
    this.updateScoreboard();
    this.createJoinButtons();
  }

  createJoinButtons() {
    const join1 = new PressToJoin(this, this.gameScene, {
      text: 'PRESS SPACE TO JOIN',
      image: 'rikard',
      color: 0xffffff * Math.random(),
      controls: {
        up: 'up',
        down: 'down',
        left: 'left',
        right: 'right',
        boost: 'space'
      },
      joinButton: 'space'
    });
    join1.label.setOrigin(0, 0.5);
    join1.label.setPosition(150, 50);

    const join2 = new PressToJoin(this, this.gameScene, {
      text: 'PRESS Q TO JOIN',
      image: 'anders',
      color: 0xffffff * Math.random(),
      controls: {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        boost: 'q'
      },
      joinButton: 'q'
    });
    join2.label.setOrigin(0.5);
    join2.label.setPosition(this.game.config.width / 2, 50);

    const join3 = new PressToJoin(this, this.gameScene, {
      text: 'PRESS B TO JOIN (MOUSE)',
      image: 'adrian',
      color: 0xffffff * Math.random(),
      controls: {
        boost: 'b'
      },
      useMouse: true,
      joinButton: 'b'
    });
    join3.label.setOrigin(1, 0.5);
    join3.label.setPosition(this.game.config.width - 150, 50);

    const join4 = new PressToJoin(this, this.gameScene, {
      text: 'PRESS + TO ADD AI PLAYER',
      useAi: true,
      joinButton: 'plus',
      maxAdd: 4
    });
    join4.label.setOrigin(1, 0.5);
    join4.label.setPosition(
      this.game.config.width - 150,
      this.game.config.height - 20
    );
  }

  updateScoreboard() {
    if (!this.created) {
      return;
    }

    const distance = 150;
    let x =
      this.game.config.width / 2 -
      ((this.playerAvatars.length - 1) / 2) * distance;
    const y = this.game.config.height - 70;

    this.powerUps.forEach(pu => {
      pu.destroy();
    });

    if (!this.players.length) {
      return;
    }

    const [currentLeader] = this.players.filter(p => p.leader);
    const allPoints = this.players.map(p => p.points);
    const highestPoints = Math.max(...allPoints);
    if (!currentLeader || currentLeader.points !== highestPoints) {
      if (currentLeader) {
        currentLeader.leader = false;
      }
      this.players[allPoints.indexOf(highestPoints)].leader = true;
    }

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

      pointsText.setPosition(x, y + 50);
      pointsText.setText(allPoints[i]);

      if (p.leader) {
        this.crown.setPosition(x + 8, y - 28);
      }

      x += distance;
    });
  }

  addPlayerToScoreBoard(player) {
    const playerAvatar = player.playerAvatar.clone(this);
    playerAvatar.setScale(0.1);

    const fontStyle = {
      fontFamily: 'LatoBold',
      fontSize: 20,
      color: '#ffffff'
    };

    const killText = this.add.text(0, 0, '0', fontStyle);
    const deathText = this.add.text(0, 0, '0', fontStyle);
    const assistText = this.add.text(0, 0, '0', fontStyle);
    const suicideText = this.add.text(0, 0, '0', fontStyle);
    const pointsText = this.add.text(0, 0, '0', fontStyle);
    assistText.setOrigin(1, 0);
    suicideText.setOrigin(1, 0);
    pointsText.setOrigin(0.5, 1);

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
