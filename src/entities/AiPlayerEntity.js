import PlayerEntity from './PlayerEntity';

import {
  GAME_CONFIG
} from '../config/constants';

const {
  TARGET_TIREDNESS_TIME_MAX,
  TARGET_TIREDNESS_TIME_MIN,
  DEFAULT_SPEED,
  SPEED_RANDOMNESS,
  AI_STUCK_LIMIT,
  BOOST_THRESHOLD,
  BOOST_DELAY_RANDOMNESS,
  BOOST_DIRECTION_MIN,
  BOOST_DIRECTION_MAX
} = GAME_CONFIG.AI;

export default class AiPlayerEntity extends PlayerEntity {
  disableController = true;
  target = null;
  lastTargetUpdateTime = 0;
  currentTargetAttentionTime = 0;
  lastCollision = null;
  performBoost = false;
  lastBoostTime = 0;
  performBoostAt = null;

  constructor(scene, config) {
    super(scene, config);
    this.scene.events.on('player-dead', this.handleTargetGone, this);
    this.scene.events.on('power-up-removed', this.handleTargetGone, this);
    this.scene.events.on('power-up-consumed', this.handleTargetGone, this);
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.isAlive) {
      this.updateTarget(time);
      this.move();
    }
  }

  spawn() {
    super.spawn();
    this.target = null;
    this.lastCollision = null;
  }

  updateTarget(time) {
    if (this.shouldGetNewTarget()) {
      this.setTarget(Math.random() < 0.2 ? this.findAnyTarget() : this.findSuitableTarget(), time);
    } else if (this.tiredOfChasing(time)) {
      this.setTarget(this.findSuitableTarget(this.target), time);
    }
  }

  setTarget(target, time) {
    if (target) {
      this.target = target;
      this.lastTargetUpdateTime = time;
      this.currentTargetAttentionTime = Phaser.Math.Between(TARGET_TIREDNESS_TIME_MIN, TARGET_TIREDNESS_TIME_MAX);
    }
  }

  shouldGetNewTarget() {
    return this.target === null || !this.target.isActive;
  }

  tiredOfChasing(time) {
    return this.lastTargetUpdateTime + this.currentTargetAttentionTime < time;
  }

  move() {
    const force = new Phaser.Math.Vector2(0, 0);
    const gotoPosition = (this.target && this.target.hasPosition()) ? this.target.getPosition() : this.scene.ground.sprite;

    const {
      velX, velY
    } = this.velocityToTarget(
      this.getPosition(),
      gotoPosition,
      this.getSpeed()
    );

    const vector = new Phaser.Math.Vector2(this.applySpeedModifiers(velX), this.applySpeedModifiers(velY));
    force.add(vector);
    this.matterObj.applyForce(force);

    if (this.shouldPerformBoost()) {
      const direction = Phaser.Math.Between(BOOST_DIRECTION_MIN, BOOST_DIRECTION_MAX) * Math.random() < 0.5 ? 1 : -1;
      this.applyBoost(force, this.boostUp(), direction);
      this.performBoostAt = null;
      this.lastBoostTime = this.scene.time.now;
    }
  }

  shouldPerformBoost() {
    return (this.performBoostAt &&
      this.performBoostAt < this.scene.time.now &&
      this.scene.time.now > this.lastBoostTime + BOOST_THRESHOLD);
  }

  getSpeed() {
    const speed = this.target
      ? DEFAULT_SPEED
      : DEFAULT_SPEED * 0.3;

    return speed + Math.random() * SPEED_RANDOMNESS;
  }

  addPowerUp(powerUp) {
    super.addPowerUp(powerUp);
    this.target = null;
  }

  getPossiblePlayerTargets(onSameContinent = false, excludedTargetIds = []) {
    excludedTargetIds.push(this.id);
    const targets = this.scene.players.filter(player => (player.isAlive && !excludedTargetIds.includes(player.id)));
    if (!onSameContinent) {
      return targets;
    }
    const myGrounds = this.grounds.map(g => g.label);
    return targets.filter((player) => {
      const playerGrounds = player.grounds.map(g => g.label);
      return myGrounds.some(r => playerGrounds.includes(r));
    });
  }

  getPowerUpTargets() {
    return this.scene.powerUpService.available;
  }

  findSuitableTarget(excludedTarget) {
    const possibleTargets = this.getPossiblePlayerTargets(true, excludedTarget ? [excludedTarget.id] : []).concat(this.getPowerUpTargets());
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

  findAnyTarget() {
    const possibleTargets = this.getPossiblePlayerTargets().concat(this.getPowerUpTargets());
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

  handleTargetGone(target) {
    if (this.target && this.target.id === target.id) {
      console.log('AI players target is gone', this.id, this.target.id);
      this.target = null;
    }
  }

  updateLastCollision(collidedPlayer, collision) {
    const {
      normal, tangent, penetration
    } = collision;
    this.lastCollision = {
      player: collidedPlayer,
      time: this.scene.time.now,
      collision: {
        normal,
        tangent,
        penetration
      }
    };
  }

  isStuckCollidingWithAI(collidedPlayer, collision) {
    if (collidedPlayer.constructor.name !== this.constructor.name ||
      this.lastCollision === null ||
      this.scene.time.now > this.lastCollision.time + AI_STUCK_LIMIT
    ) {
      return;
    }

    const normalVector1 = new Phaser.Math.Vector2(collision.normal);
    const normalVector2 = new Phaser.Math.Vector2(this.lastCollision.collision.normal);
    return normalVector1.subtract(normalVector2).length() < 0.015;
  }

  compareWithLastCollisionValue(collision, property) {
    const a = new Phaser.Math.Vector2(collision[property]);
    const b = new Phaser.Math.Vector2(this.lastCollision.collision[property]);
    return a.subtract(b);
  }

  updatePlayerCollision(collidedPlayer, collision) {
    super.updatePlayerCollision(collidedPlayer, collision);
    if (this.isStuckCollidingWithAI(collidedPlayer, collision)) {
      this.makeStuckDescision();
    }
    this.updateLastCollision(collidedPlayer, collision);
  }

  makeStuckDescision() {
    if (Math.random() < 0.5) {
      this.target = null;
    } else if (!this.boosting && !this.performBoostAt) {
      this.performBoostAt = Phaser.Math.Between(BOOST_THRESHOLD * BOOST_DELAY_RANDOMNESS, BOOST_THRESHOLD) + this.scene.time.now;
    }
  }
}
