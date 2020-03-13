import {
  COLLISION_CATEGORIES, DEPTHS
} from '../config/constants';
import MathUtils from '../utils/Math';

const POINT_EDGE_MARGIN = 25;

export default class GroundEntity {
  sprite = null;
  scene = null;
  continents = [];
  groundBodies = [];

  constructor({
    scene, onCollideCallback, onCollideEndCallback, level
  }) {
    this.scene = scene;

    var shapes = this.scene.cache.json.get('shapes');

    this.sprite = this.scene.matter.add.sprite(
      scene.game.config.width / 2,
      scene.game.config.height / 2,
      level.shape,
      null,
      {
        shape: shapes[level.shape]
      }
    );

    this.sprite.setDepth(DEPTHS.GROUND);

    this.sprite.setCollisionCategory(COLLISION_CATEGORIES.GROUND);
    this.sprite.setCollidesWith(
      COLLISION_CATEGORIES.POWER_UP | COLLISION_CATEGORIES.PLAYER
    );

    this.prepareContinentData();
    this.groundBodies.forEach((groundBody) => {
      groundBody.collisionFilter.category = COLLISION_CATEGORIES.GROUND;
      groundBody.collisionFilter.mask = COLLISION_CATEGORIES.POWER_UP | COLLISION_CATEGORIES.PLAYER;
      groundBody.onCollideCallback = onCollideCallback;
      groundBody.onCollideEndCallback = onCollideEndCallback;
    });

    if (this.sprite.world.debugConfig.showBody) {
      this.debugPrintDropZones();
    }
  }

  debugPrintDropZones() {
    this.groundBodies.forEach((groundBody) => {
      const width = groundBody.bounds.max.x - groundBody.bounds.min.x;
      const height = groundBody.bounds.max.y - groundBody.bounds.min.y;

      this.scene.matter.add.rectangle(
        groundBody.position.x,
        groundBody.position.y,
        width - POINT_EDGE_MARGIN * 2,
        height - POINT_EDGE_MARGIN * 2,
        {
          isStatic: true,
          render: {
            lineColor: 0xFF00CC
          }
        }
      );
    });
  }

  prepareContinentData() {
    const continents = {};
    this.groundBodies = [];
    this.sprite.body.parts.filter(part => part.id !== this.sprite.body.id)
      .forEach((part) => {
        if (!continents[part.label]) {
          continents[part.label] = {
            area: 0,
            label: part.label,
            parts: []
          };
        }
        continents[part.label].parts.push(part);
        continents[part.label].area += part.area;
        this.groundBodies.push(part);
      });

    this.continents = Object.values(continents);
  }

  getWeightedRandomBody(bodies) {
    return bodies[MathUtils.GetWeightedRandomIndex(bodies.map((c) => c.area))];
  }

  getRandomPosition() {
    const tile = this.getWeightedRandomBody(this.groundBodies);
    const width = tile.bounds.max.x - tile.bounds.min.x;
    const height = tile.bounds.max.y - tile.bounds.min.y;

    return (new Phaser.Geom.Rectangle(
      tile.position.x - width / 2,
      tile.position.y - height / 2,
      width - POINT_EDGE_MARGIN * 2,
      height - POINT_EDGE_MARGIN * 2,
    )).getRandomPoint();
  }
}
