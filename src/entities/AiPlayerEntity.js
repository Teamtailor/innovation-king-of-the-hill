import PlayerEntity from './PlayerEntity';
import MathUtils from '../utils/Math';
import {
  GAME_CONFIG,
  COLLISION_CATEGORIES
} from '../config/constants';

const {
  TARGET_TIREDNESS_TIME_MAX,
  TARGET_TIREDNESS_TIME_MIN,
  DEFAULT_SPEED,
  SPEED_RANDOMNESS,
  AI_STUCK_LIMIT,
  STUCK_BOOST_THRESHOLD,
  STUCK_BOOST_DELAY_RANDOMNESS,
  BOOST_DIRECTION_MIN,
  BOOST_DIRECTION_MAX,
  DEFAULT_REACTION_TIME,
  REACTION_SPEED_RANDOMNESS,
  AI_TARGET_DISTANCE_HISTORY,
  DEFAULT_RANDOM_BOOST_DISTANCE,
  RANDOM_BOOST_DISTANCE_MODIFER,
  RANDOM_BOOST_TIME_MIN,
  RANDOM_BOOST_TIME_MAX,
  RANDOM_BOOST_LIKELINESS,
  WEIRD_REVERSED_MOVE_MIN,
  WEIRD_REVERSED_MOVE_MAX
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
  lastMoveVector = null;
  shouldUpdateReactionTimeAt = 0;
  shouldMakeStuckDescisionAt = 0;
  stopDoingWeirdReverseMoveAt = 0;
  performRandomBoost = false;
  nextRandomBoostPerformAt = 0;
  nextRandomBoostDistanceThreshold = DEFAULT_RANDOM_BOOST_DISTANCE;
  currentReactionTime = DEFAULT_REACTION_TIME;
  aiTargetDistances = [];
  aiTargetDistancesModifer = 0;

  maneuverStartTime = 0;
  maneuverTime = 0;
  maneuverToPoint = null;

  constructor(scene, config) {
    super(scene, config);
    this.scene.events.on('player-dead', this.handleTargetGone, this);
    this.scene.events.on('power-up-removed', this.handleTargetGone, this);
    this.scene.events.on('power-up-consumed', this.handleTargetGone, this);
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.isAlive) {
      this.makeStuckDescision(time);
      this.updateTarget(time);
      this.updateReactionTime(time);
      this.updateTargetDistances(time);
      this.updateManeuver(time);
      this.updateWeirdReverseMove(time);
      // this.updateRandomBoost(time);
      this.move(time);
    }
  }

  updateWeirdReverseMove(time) {
    if (time < this.stopDoingWeirdReverseMoveAt) {
      return;
    }
    this.stopDoingWeirdReverseMoveAt = 0;
    this.reverseControls = this.hasPowerUp('Drunk');
  }

  updateRandomBoost(time) {
    if (time < this.nextRandomBoostPerformAt || !this.hasMovingTarget()) {
      return;
    }

    if (this.getDistanceToPoint(this.target.getPosition()) < this.nextRandomBoostDistanceThreshold) {
      if (Math.random() < RANDOM_BOOST_LIKELINESS) {
        this.performRandomBoost = true;
      } else {
        this.setRandomBoostVars();
      }
    }
  }

  updateManeuver(time) {
    if (!this.maneuverToPoint) {
      return;
    }

    if (time > this.maneuverStartTime + this.maneuverTime ||
      this.getDistanceToPoint(this.maneuverToPoint) < 20) {
      this.resetManeuver();
    }
  }

  updateTargetDistances(time) {
    if (!this.hasTarget() || !this.isTargetAiPlayer()) {
      return;
    }

    this.aiTargetDistances.unshift(this.getDistanceToPoint(this.target.getPosition()));
    if (this.aiTargetDistances.length > AI_TARGET_DISTANCE_HISTORY) {
      this.aiTargetDistances = this.aiTargetDistances.slice(0, AI_TARGET_DISTANCE_HISTORY);
    }
  }

  updateReactionTime(time) {
    if (time < this.shouldUpdateReactionTimeAt || !this.hasMovingTarget()) {
      return;
    }

    this.shouldUpdateReactionTimeAt = time + Phaser.Math.Between(350, 750);

    let reactionTime = MathUtils.RandomSign(
      Math.random() * REACTION_SPEED_RANDOMNESS * DEFAULT_REACTION_TIME
    );
    reactionTime += DEFAULT_REACTION_TIME;

    const distanceToTarget = this.getDistanceToPoint(this.target.getPosition());
    if (distanceToTarget < 250) {
      reactionTime = reactionTime * (distanceToTarget / 250);
    }

    this.currentReactionTime = Phaser.Math.RoundTo(reactionTime);
  }

  spawn() {
    super.spawn();
    this.resetManeuver();
    this.setRandomBoostVars();
    this.setRandomAiTargetDistancesModifer();

    this.escapeTo = null;
    this.target = null;
    this.lastCollision = null;
    this.currentReactionTime = DEFAULT_REACTION_TIME;
    this.shouldUpdateReactionTimeAt = 0;
    this.shouldMakeStuckDescisionAt = 0;
    this.stopDoingWeirdReverseMoveAt = 0;
  }

  setRandomAiTargetDistancesModifer() {
    this.aiTargetDistancesModifer = Phaser.Math.Between(0, 20);
  }

  onCliffAhead() {
    if (this.grounds.length) {
      this.escapeTo = this.grounds[0].position;
    }
    this.target = null;
  }

  updateTarget(time) {
    if (this.shouldGetNewTarget()) {
      this.setTarget(Math.random() < 0.2 ? this.findAnyTarget() : this.findSuitableTarget(), time);
    } else if (this.tiredOfChasing(time)) {
      this.setTarget(this.findSuitableTarget(this.target), time);
    }
  }

  setRandomBoostVars() {
    const randomDistanceModifier = MathUtils.RandomSign(Phaser.Math.Between(0, RANDOM_BOOST_DISTANCE_MODIFER));
    this.nextRandomBoostDistanceThreshold = DEFAULT_RANDOM_BOOST_DISTANCE + randomDistanceModifier;
    this.nextRandomBoostPerformAt = this.scene.time.now + Phaser.Math.Between(RANDOM_BOOST_TIME_MIN, RANDOM_BOOST_TIME_MAX);
    this.performRandomBoost = false;
  }

  setTarget(target, time) {
    if (target) {
      this.target = target;
      this.lastTargetUpdateTime = time;
      this.currentTargetAttentionTime = Phaser.Math.Between(TARGET_TIREDNESS_TIME_MIN, TARGET_TIREDNESS_TIME_MAX);
      this.shouldUpdateReactionTimeAt = 0;
      this.aiTargetDistances = [];
    }
  }

  shouldGetNewTarget() {
    return this.target === null || !this.target.isActive;
  }

  tiredOfChasing(time) {
    return this.lastTargetUpdateTime + this.currentTargetAttentionTime < time;
  }

  hasReachedIdlePosition() {
    return this.getDistanceToPoint(this.scene.ground.sprite) < 50;
  }

  hasTarget() {
    return this.target && this.target.hasPosition();
  }

  hasMovingTarget() {
    return this.hasTarget() && this.isTargetPlayer();
  }

  isTargetPlayer() {
    return this.target.type === COLLISION_CATEGORIES.PLAYER;
  }

  isTargetAiPlayer() {
    return this.target.type === COLLISION_CATEGORIES.PLAYER && this.target.constructor.name === this.constructor.name;
  }

  getPointOfInterest(time) {
    if (this.escapeTo) {
      const e = new Phaser.Math.Vector2(this.escapeTo).subtract(this.getPosition());
      if (e.length() > 16) {
        return this.escapeTo;
      }
      this.escapeTo = null;
    }

    if (!this.hasTarget()) {
      return this.scene.ground.sprite;
    }

    if (this.isManeuvering()) {
      return this.maneuverToPoint;
    }

    if (!this.isTargetPlayer()) {
      return this.target.getPosition();
    }

    if (this.shouldTrySomething()) {
      const rand = Phaser.Math.Between(0, 2);
      if (rand === 0) {
        this.reverseControls = true;
        this.aiTargetDistances = [];
        this.stopDoingWeirdReverseMoveAt = time + Phaser.Math.Between(WEIRD_REVERSED_MOVE_MIN, WEIRD_REVERSED_MOVE_MAX);
        return this.target.getPosition();
      } else if (rand === 1) {
        this.performRandomBoost = true;
        return this.target.getPosition();
      } else {
        return this.doManeuver(time);
      }
    }

    return this.target.getPreviousPosition(this.currentReactionTime);
  }

  shouldTrySomething() {
    return (this.isTargetAiPlayer() &&
      !this.boosting &&
      Math.random() < 0.03 &&
      this.notCatchingUp() &&
      !this.isTryingSomething() &&
      !this.target.isTryingSomething());
  }

  isTryingSomething() {
    return this.isDoingWeirdMove() || this.isManeuvering();
  }

  isDoingWeirdMove() {
    return this.stopDoingWeirdReverseMoveAt > this.scene.time.now;
  }

  isManeuvering() {
    return !!this.maneuverToPoint;
  }

  resetManeuver() {
    this.maneuverStartTime = 0;
    this.maneuverTime = 0;
    this.maneuverToPoint = null;
  }

  doManeuver(time) {
    const continent = this.grounds.length === 0 ? 'main-ground' : this.grounds[0].label;
    this.maneuverToPoint = this.scene.getRandomGroundPosition(continent);
    this.maneuverStartTime = time;
    this.maneuverTime = Phaser.Math.Between(250, 500);
    return this.maneuverToPoint;
  }

  move(time) {
    const force = new Phaser.Math.Vector2(0, 0);

    if (!this.hasTarget() && this.hasReachedIdlePosition()) {
      const tenthOfTime = Phaser.Math.RoundTo(this.scene.time.now / 100, 2) / 100;
      this.matterObj.setAngularVelocity(0.15 * (Phaser.Math.IsEven(tenthOfTime) ? -1 : 1));
      return;
    }

    const pointOfInterest = this.getPointOfInterest(time);

    const {
      velX, velY
    } = this.velocityToTarget(
      this.getPosition(),
      pointOfInterest,
      this.getSpeed()
    );

    const vector = new Phaser.Math.Vector2(this.applySpeedModifiers(velX), this.applySpeedModifiers(velY));
    force.add(vector);
    this.matterObj.applyForce(force);

    if (this.shouldPerformBoost(time)) {
      const direction = MathUtils.RandomSign(Phaser.Math.Between(BOOST_DIRECTION_MIN, BOOST_DIRECTION_MAX));
      this.boostUp();
      this.applyBoost(force, direction);
      this.performBoostAt = null;
      this.lastBoostTime = time;
      this.matterObj.setAngularVelocity(Math.random() * 40 - 20);

      if (this.performRandomBoost) {
        this.setRandomBoostVars();
      }
    }
  }

  notCatchingUp() {
    if (this.aiTargetDistances.length < AI_TARGET_DISTANCE_HISTORY - this.aiTargetDistancesModifer) {
      return false;
    }
    this.setRandomAiTargetDistancesModifer();
    return Math.max(...this.aiTargetDistances) - Math.min(...this.aiTargetDistances) < 45;
  }

  shouldPerformBoost(time) {
    return (this.performRandomBoost ||
      (this.performBoostAt &&
      this.performBoostAt < time &&
      time > this.lastBoostTime + STUCK_BOOST_THRESHOLD));
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

  getAllPossibleTargets(excludedTarget) {
    return this.getPossiblePlayerTargets(true, excludedTarget ? [excludedTarget.id] : []).concat(this.getPowerUpTargets());
  }

  findSuitableTarget(excludedTarget) {
    return this.findClosestTarget(excludedTarget);
  }

  findClosestTarget(excludedTarget) {
    const possibleTargets = this.getAllPossibleTargets(excludedTarget);
    if (possibleTargets.length === 0) {
      return null;
    }

    let closestTargetPosition = Phaser.Math.MAX_SAFE_INTEGER;
    let closestTarget = null;
    possibleTargets.forEach(target => {
      const distance = this.getDistanceToPoint(target.getPosition());
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
    this.aiTargetDistances = [];
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
      this.shouldMakeStuckDescisionAt = this.scene.time.now + Phaser.Math.Between(20, 120);
    }
    this.updateLastCollision(collidedPlayer, collision);
  }

  shouldMakeStuckDescision() {
    return this.shouldMakeStuckDescisionAt > 0;
  }

  makeStuckDescision(time) {
    if (!this.shouldMakeStuckDescision() || time < this.shouldMakeStuckDescisionAt) {
      return;
    }

    const rand = Phaser.Math.Between(0, 8);

    if (rand > 6) {
      if (!this.boosting && !this.performBoostAt) {
        this.performBoostAt = Phaser.Math.Between(
          STUCK_BOOST_THRESHOLD * STUCK_BOOST_DELAY_RANDOMNESS,
          STUCK_BOOST_THRESHOLD
        ) + this.scene.time.now;
      }
    } else if (rand > 2) {
      this.doManeuver();
    } else {
      this.target = null;
    }

    this.shouldMakeStuckDescisionAt = 0;
  }
}
