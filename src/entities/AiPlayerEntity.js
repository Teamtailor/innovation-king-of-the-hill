import PlayerEntity from './PlayerEntity';

import {
  GAME_CONFIG
} from '../config/constants';

const TARGET_TIREDNESS_TIME = 3500;

export default class AiPlayerEntity extends PlayerEntity {
  disableController = true;
  target = null;
  lastTargetTime = 0;

  constructor(scene, config) {
    super(scene, config);
    this.scene.events.on('player-dead', this.handlePlayerDead, this);
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.isAlive) {
      this.updateTarget(time);
      this.move();
    }
  }

  readController(delta) {
  }

  spawn() {
    super.spawn();
    this.target = null;
  }

  updateTarget(time) {
    if (this.shouldGetNewTarget()) {
      this.setTarget(Math.random() < 0.2 ? this.findSomeTarget() : this.findSuitableTarget(), time);
    } else if (this.tiredOfChasing(time)) {
      this.setTarget(this.findSomeTarget(), time);
    }
  }

  setTarget(target, time) {
    if (target) {
      this.target = target;
      this.lastTargetTime = time;
    }
  }

  shouldGetNewTarget() {
    return this.target === null || !this.target.isAlive;
  }

  tiredOfChasing(time) {
    return this.lastTargetTime + TARGET_TIREDNESS_TIME < time;
  }

  move() {
    const force = new Phaser.Math.Vector2(0, 0);

    const gotoPosition = this.target ? this.target.getPosition() : this.scene.ground.sprite;

    const {
      velX, velY
    } = this.velocityToTarget(
      this.getPosition(),
      gotoPosition,
      this.target
        ? GAME_CONFIG.DEFAULT_SPEED
        : GAME_CONFIG.DEFAULT_SPEED * 0.25
    );

    const vector = new Phaser.Math.Vector2(this.applySpeedModifiers(velX), this.applySpeedModifiers(velY));
    force.add(vector);
    this.matterObj.applyForce(force);
  }

  getPossibleTargets(onSameContinent = false) {
    const targets = this.scene.players.filter(player => (player.isAlive && player.id !== this.id));
    if (!onSameContinent) {
      return targets;
    }
    const myGrounds = this.grounds.map(g => g.label);
    return targets.filter((player) => {
      const playerGrounds = player.grounds.map(g => g.label);
      return myGrounds.some(r => playerGrounds.includes(r));
    });
  }

  findSuitableTarget() {
    const possibleTargets = this.getPossibleTargets(true);
    if (possibleTargets.length === 0) {
      return null;
    }

    let closestTargetPosition = Phaser.Math.MAX_SAFE_INTEGER;
    let closestTarget = null;
    possibleTargets.forEach(target => {
      const distance = Phaser.Math.Distance.BetweenPoints(this.getPosition(), target.getPosition());
      if (distance < closestTargetPosition) {
        closestTargetPosition = distance;
        closestTarget = target;
      }
    });

    return closestTarget;
  }

  findSomeTarget() {
    const possibleTargets = this.getPossibleTargets();
    if (possibleTargets.length === 0) {
      return null;
    }
    return possibleTargets[Phaser.Math.Between(0, possibleTargets.length - 1)];
  }

  velocityToTarget(from, to, inSpeed) {
    const direction = Math.atan((to.x - from.x) / (to.y - from.y));
    const speed = to.y >= from.y ? inSpeed : -inSpeed;

    return {
      velX: speed * Math.sin(direction),
      velY: speed * Math.cos(direction)
    };
  }

  handlePlayerDead(player) {
    if (this.target && this.target.id === player.id) {
      console.log('AI players target died', this.id, this.target.id);
      this.target = null;
    }
  }
}
