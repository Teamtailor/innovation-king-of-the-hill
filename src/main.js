import Phaser from 'phaser';
import io from 'socket.io-client';
import constants from './config/constants';
import BootScene from './scenes/BootScene';

window.Phaser = Phaser;
window.SocketIO = io('http://localhost:3000');

const config = {
  type: Phaser.WEBGL,
  pixelArt: false,
  roundPixels: true,
  parent: 'content',
  width: constants.WIDTH,
  height: constants.HEIGHT,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: {
        x: 0,
        y: 0
      },
      debug: {
        showVelocity: true,
        showBody: true
      }
    }
  },
  scene: [BootScene]
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
