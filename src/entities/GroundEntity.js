const PATH = [
  {
    x: 50, y: 50
  },
  {
    x: 150, y: 0
  },
  {
    x: 430, y: 55
  },
  {
    x: 900, y: 15
  },
  {
    x: 1020, y: 45
  },
  {
    x: 1060, y: 175
  },
  {
    x: 1000, y: 275
  },
  {
    x: 1080, y: 325
  },
  {
    x: 990, y: 450
  },
  {
    x: 800, y: 620
  },
  {
    x: 600, y: 500
  },
  {
    x: 550, y: 440
  },
  {
    x: 520, y: 380
  },
  {
    x: 150, y: 445
  },
  {
    x: 40, y: 250
  }
];

export default class GroundEntity {
  constructor() {
    this._polygon = new Phaser.Geom.Polygon(PATH);
  }

  get polygon() {
    return this._polygon;
  }

  get path() {
    return this.polygon.points;
  }
}
