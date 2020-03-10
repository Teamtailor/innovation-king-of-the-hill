export default class PlayerEntity {
    constructor(
        scene,
        {
            image = 'avatar1', color = 0xf43f85, controls, ground
        }
    ) {
        this.scene = scene;

        this.maskShape = scene.make
            .graphics()
            .fillCircleShape(new Phaser.Geom.Circle(0, 0, 22));

        this.border = scene.add
            .graphics({
                fillStyle: {
                    color
                }
            })
            .fillCircleShape(new Phaser.Geom.Circle(0, 0, 24));

        this.matterObj = scene.matter.add.image(
            scene.game.config.width / 2,
            scene.game.config.height / 2,
            image
        );
        this.matterObj.setCircle(24);
        this.matterObj.setDensity(0.005);
        this.matterObj.setFriction(0.2, 0.2);
        this.matterObj.setBounce(1);
        this.matterObj.setMask(this.maskShape.createGeometryMask());

        this.strength = 1;
        this.fatigue = 0;

        this.keys = scene.input.keyboard.addKeys(controls);
    }

    getAvailableStrength(delta) {
        return (this.strength * 1 - this.fatigue) * (delta / (1000 / 60));
    }

    readController(delta) {
        const availableStrength = this.getAvailableStrength(delta);

        if (this.fatigue > 0) {
            this.fatigue -= ((delta / (1000 / 60)) * 0.5) / 60;
            if (this.fatigue < 0) this.fatigue = 0;
        }

        if (this.disableController || !availableStrength) {
            return;
        }

        const {
            up = {},
            down = {},
            left = {},
            right = {},
            boost = {}
        } = this.keys;

        if (up.isDown) {
            this.matterObj.applyForce(
                new Phaser.Math.Vector2(0.0, -0.05 * availableStrength)
            );
        }
        if (down.isDown) {
            this.matterObj.applyForce(
                new Phaser.Math.Vector2(0.0, 0.05 * availableStrength)
            );
        }
        if (left.isDown) {
            this.matterObj.applyForce(
                new Phaser.Math.Vector2(-0.05 * availableStrength, 0)
            );
        }
        if (right.isDown) {
            this.matterObj.applyForce(
                new Phaser.Math.Vector2(0.05 * availableStrength, 0)
            );
        }

        if (boost.isDown) {
            this.boosting = true;
        }
        if (boost.isUp && this.boosting) {
            if (up.isDown) {
                this.matterObj.applyForce(
                    new Phaser.Math.Vector2(0.0, -0.5 * availableStrength)
                );
            }
            if (down.isDown) {
                this.matterObj.applyForce(
                    new Phaser.Math.Vector2(0.0, 0.5 * availableStrength)
                );
            }
            if (left.isDown) {
                this.matterObj.applyForce(
                    new Phaser.Math.Vector2(-0.5 * availableStrength, 0)
                );
            }
            if (right.isDown) {
                this.matterObj.applyForce(
                    new Phaser.Math.Vector2(0.5 * availableStrength, 0)
                );
            }

            this.boosting = false;

            if (up.isDown || down.isDown || left.isDown || right.isDown) {
                this.fatigue += this.fatigue < 1 - 0.2 ? 0.2 : 1 - this.fatigue;
            }
        }
    }

    updateMask() {
        this.border.setPosition(this.matterObj.x, this.matterObj.y);
        this.maskShape.setPosition(this.matterObj.x, this.matterObj.y);
    }

    destroy() {
        this.matterObj.destroy();
        this.border.destroy();
        this.maskShape.destroy();
    }

    die() {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: [this.matterObj, this.maskShape, this.border],
                scale: 0,
                ease: 'Sine.easeIn',
                duration: 1000,
                yoyo: false,
                repeat: 0,
                onComplete: () => {
                    resolve();
                }
            });

            this.matterObj.setCollisionCategory(0);
            this.matterObj.setFriction(0, 0, 0);
            this.matterObj.setVelocity(0);
            this.matterObj.setAngularVelocity(0.2);

            this.disableController = true;
        });
    }

    update(time, delta) {
        this.updateMask();
        this.readController(delta);
    }
}
