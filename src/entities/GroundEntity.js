import {
  COLLISION_CATEGORIES, DEPTHS
} from '../config/constants';

const GROUND_POSITION_MARGIN = 30;

export default class GroundEntity {
  sprite = null;
  scene = null;

  constructor({
    scene, onCollideCallback, onCollideEndCallback
  }) {
    this.scene = scene;

    var shapes = this.scene.cache.json.get('shapes');

    this.sprite = this.scene.matter.add.sprite(
      scene.game.config.width / 2,
      scene.game.config.height / 2,
      'level',
      null,
      {
        shape: shapes.level
      }
    );

    this.sprite.setDepth(DEPTHS.GROUND);

    // this needed to be done because of a bug when importing shape from PhysicsEditor (cant set regular callback)
    this.scene.matter.world.on('collisionstart', function(event) {
      for (var i = 0; i < event.pairs.length; i++) {
        const pair = event.pairs[i];

        if (pair.bodyA.label === 'ground') {
          onCollideCallback(pair);
        }
      }
    });

    this.scene.matter.world.on('collisionend', function(event) {
      for (var i = 0; i < event.pairs.length; i++) {
        const pair = event.pairs[i];

        if (pair.bodyA.label === 'ground') {
          onCollideEndCallback(pair);
        }
      }
    });

    this.sprite.setCollisionCategory(COLLISION_CATEGORIES.GROUND);
    this.sprite.setCollidesWith(
      COLLISION_CATEGORIES.POWER_UP | COLLISION_CATEGORIES.PLAYER
    );
  }

  pointIsOnGround(x, y) {
    const bodies = this.scene.matter.world.getAllBodies();
    const groundBodies = bodies.filter(b => b.label === 'ground');
    const isOnGround = !!this.scene.matter.query.point(groundBodies, {
      x,
      y
    }).length;

    return isOnGround;
  }

  getRandomPosition() {
    const {
      x, y, width, height
    } = this.sprite.getBounds();

    const rect = new Phaser.Geom.Rectangle(
      x + GROUND_POSITION_MARGIN,
      y + GROUND_POSITION_MARGIN,
      width - GROUND_POSITION_MARGIN * 2,
      height - GROUND_POSITION_MARGIN * 2
    );

    let point = rect.getRandomPoint();

    // give this 20 tries to not lock the process
    for (var i = 0; !this.pointIsOnGround(point.x, point.y) && i < 20; i++) {
      point = rect.getRandomPoint();
    }

    return point;
  }
}
