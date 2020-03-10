import GameScene from './GameScene';
import constants from '../config/constants';

class TitleScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'TitleScene'
        });
    }

    preload() {}

    create() {
        var particles = this.add.particles('teamtailor');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: {
                start: 1,
                end: 0
            },
            rotate: {
                min: 0,
                max: 0
            },
            blendMode: 'ADD'
        });

        this.matter.world.setBounds(
            10,
            10,
            constants.WIDTH - 20,
            constants.HEIGHT - 20
        );

        var logo = this.matter.add.image(400, 100, 'teamtailor');
        logo.setFriction(0, 0, 0);
        logo.applyForce(new Phaser.Math.Vector2(0.1, -0.1));
        logo.setAngularVelocity(0.1);
        logo.setBounce(1);

        emitter.startFollow(logo, 0, 0, true);

        this.logo = logo;
        this.emitter = emitter;
        this.particles = particles;

        this.emitter.onParticleEmit((p, _) => {
            p.rotation = this.logo.body.angle;
            p.data.rotate.max = (this.logo.body.angle * 180) / Math.PI;
            p.data.rotate.min = (this.logo.body.angle * 180) / Math.PI;
        });

        this.input.once('pointerdown', () => {
            this.scene.add('GameScene', GameScene);
            this.scene.start('GameScene');
        });
    }

    update(time, delta) {}
}

export default TitleScene;
