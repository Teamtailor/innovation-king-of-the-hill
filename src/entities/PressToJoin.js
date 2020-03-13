import PlayerEntity from '../entities/PlayerEntity';
import AiPlayerEntity from '../entities/AiPlayerEntity';

export default class PressToJoin {
  addedPlayers = 0;
  players = [];
  aiConfigs = [
    {
      image: 'avatar1',
      color: 0xff00ff
    },
    {
      image: 'avatar2',
      color: 0xff5522
    },
    {
      image: 'avatar3',
      color: 0x00ff99
    },
    {
      image: 'avatar4',
      color: 0x5500aa
    }
  ];

  constructor(
    scene,
    gameScene,
    {
      text, controls, image, color, useMouse, joinButton, useAi, maxAdd = 1
    }
  ) {
    this.scene = scene;

    this.label = this.scene.add.text(0, 0, text, {
      fontFamily: 'LatoBold',
      fontSize: 20,
      color: '#ffffff'
    });
    this.label.setOrigin(0.5);
    this.blink();

    const keyObj = this.scene.input.keyboard.addKey(joinButton);
    keyObj.on('up', event => {
      let player = null;

      if (useAi) {
        player = new AiPlayerEntity(
          gameScene,
          this.aiConfigs[this.addedPlayers]
        );
      } else {
        player = new PlayerEntity(gameScene, {
          image,
          color,
          controls,
          useMouse
        });
      }

      this.players.push(player);
      gameScene.players.push(player);

      this.addedPlayers += 1;

      if (this.addedPlayers >= maxAdd) {
        keyObj.off('up');
      }
      this.stopBlinking();
      this.label.setAlpha(0);
    });
  }

  blink() {
    this.label.setAlpha(1);
    this.blinkingTimeout = setTimeout(() => {
      this.label.setAlpha(0);
      this.blinkingTimeout = setTimeout(() => {
        this.blink();
      }, 350);
    }, 500);
  }

  stopBlinking() {
    clearTimeout(this.blinkingTimeout);
  }
}
