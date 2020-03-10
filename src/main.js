import Phaser from 'phaser';

import constants from './config/constants';
import BootScene from './scenes/BootScene';

window.Phaser = Phaser;

const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.WEBGL,
    pixelArt: true,
    roundPixels: true,
    parent: 'content',
    width: constants.WIDTH,
    height: constants.HEIGHT,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0
            },
            debug: true
        }
    },
    scene: [BootScene]
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
