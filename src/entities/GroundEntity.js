const PATH = [
  {
    x: 50,
    y: 50
  },
  {
    x: 150,
    y: 0
  },
  {
    x: 430,
    y: 55
  },
  {
    x: 900,
    y: 15
  },
  {
    x: 1020,
    y: 45
  },
  {
    x: 1060,
    y: 175
  },
  {
    x: 1000,
    y: 275
  },
  {
    x: 1080,
    y: 325
  },
  {
    x: 990,
    y: 450
  },
  {
    x: 800,
    y: 620
  },
  {
    x: 600,
    y: 500
  },
  {
    x: 550,
    y: 440
  },
  {
    x: 520,
    y: 380
  },
  {
    x: 150,
    y: 445
  },
  {
    x: 40,
    y: 250
  }
];

const GROUND_POSITION_MARGIN = 30;

export default class GroundEntity {
  sprite = null;
  scene = null;

  constructor({
    scene, onCollideCallback, onCollideEndCallback
  }) {
    this.scene = scene;
    this._polygon = new Phaser.Geom.Polygon(PATH);

    const poly = this.scene.add.polygon(
      this.scene.game.config.width / 2,
      this.scene.game.config.height / 2,
      this.path,
      0xff0000
    );

    this.sprite = this.scene.matter.add.gameObject(poly, {
      shape: {
        type: 'fromVerts',
        verts: this.path
      },
      isStatic: true,
      isSensor: true,
      label: 'ground',
      onCollideCallback: onCollideCallback,
      onCollideEndCallback: onCollideEndCallback
    });

    const mask = this.scene.make
      .graphics({
        x: this.scene.game.config.width / 2 - this.sprite.displayOriginX,
        y: this.scene.game.config.height / 2 - this.sprite.displayOriginY
      })
      .fillPoints(PATH);

    for (var i = 0; i < 50; i += 2) {
      this.scene.add
        .graphics({
          x: this.scene.game.config.width / 2 - this.sprite.displayOriginX,
          y: this.scene.game.config.height / 2 - this.sprite.displayOriginY + i,
          fillStyle: {
            color: 0x8c3b0c
          }
        })
        .fillPoints(PATH);
    }

    this.scene.add
      .tileSprite(-1000, -1000, 3000, 3000, 'grass')
      .setOrigin(0)
      .setMask(mask.createGeometryMask());
  }

  get polygon() {
    return this._polygon;
  }

  get path() {
    return this.polygon.points;
  }

  pointIsOnGround(x, y) {
    return Phaser.Geom.Polygon.Contains(this.polygon, x, y);
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

    while (!this.pointIsOnGround(point.x, point.y)) {
      point = rect.getRandomPoint();
    }

    return point;
  }
}
