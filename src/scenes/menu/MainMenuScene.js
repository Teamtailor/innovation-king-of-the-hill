import GameScene from '../GameScene';

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainMenuScene'
        });
    }

    preload() {}

    create() {
        this.add.text(100, 100, 'Main menu', {
            fontFamily: 'Arial',
            fontSize: 64,
            color: '#00ff00'
        });

        this.input.once('pointerdown', () => {
            this.scene.add('GameScene', GameScene);
            this.scene.start('GameScene');
        });
    }
}

export default MainMenuScene;
