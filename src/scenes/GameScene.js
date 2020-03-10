import PlayerEntity from '../entities/PlayerEntity';

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
    }

    preload() {}

    create() {
        this.ground = this.matter.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height / 2,
            600,
            600,
            {
                isStatic: true,
                isSensor: true,
                onCollideEndCallback: this.collisionStop.bind(this)
            }
        );

        this.createPlayers();
    }

    async collisionStop({
        bodyB
    }) {
        const [playerToDie] = this.players.filter(
            p => p.matterObj.body === bodyB
        );

        await playerToDie.die();
        this.players = this.players.filter(p => p !== playerToDie);
        playerToDie.destroy();
    }

    createPlayers() {
        this.players = [];

        this.players.push(
            new PlayerEntity(this, {
                image: 'rikard',
                color: 0xf43f85,
                controls: {
                    up: 'up',
                    down: 'down',
                    left: 'left',
                    right: 'right',
                    boost: 'space'
                },
                ground: this.ground
            })
        );

        this.players.push(
            new PlayerEntity(this, {
                image: 'anders',
                color: 0xff0000,
                controls: {
                    up: 'w',
                    left: 'a',
                    down: 's',
                    right: 'd',
                    boost: 'r'
                },
                ground: this.ground
            })
        );

        this.players.push(
            new PlayerEntity(this, {
                image: 'adrian',
                color: 0xff0000,
                ground: this.ground
            })
        );

        this.players.push(
            new PlayerEntity(this, {
                image: 'ramya',
                color: 0xff0000,
                ground: this.ground
            })
        );

        this.players.push(
            new PlayerEntity(this, {
                color: 0xff0000,
                ground: this.ground
            })
        );

        this.players.push(
            new PlayerEntity(this, {
                image: 'avatar2',
                color: 0xff0000,
                ground: this.ground
            })
        );
    }

    update(time, delta) {
        this.players.forEach(p => {
            p.update(time, delta);
        });
    }
}

export default GameScene;
