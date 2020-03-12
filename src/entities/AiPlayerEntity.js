import PlayerEntity from './PlayerEntity';

import {
  GAME_CONFIG
} from '../config/constants';

const TARGET_TIREDNESS_TIME = 3500;

export default class AiPlayerEntity extends PlayerEntity {
  disableController = true;
  target = null;
  lastTargetTime = 0;

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
      this.setTarget(Math.random() > 0.3333 ? this.findClosestTarget() : this.findSomeTarget(), time);
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
    if (!this.target) {
      return;
    }

    const force = new Phaser.Math.Vector2(0, 0);
    const {
      velX, velY
    } = this.velocityToTarget(this.getPosition(), this.target.getPosition(), GAME_CONFIG.DEFAULT_SPEED);

    const vector = new Phaser.Math.Vector2(this.applySpeedModifiers(velX), this.applySpeedModifiers(velY));
    force.add(vector);
    this.matterObj.applyForce(force);
  }

  getPossibleTargets() {
    return this.scene.players.filter(player => (player.isAlive && player.id !== this.id));
  }

  findClosestTarget() {
    const possibleTargets = this.getPossibleTargets();
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
}
