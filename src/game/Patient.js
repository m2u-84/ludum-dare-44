
const PatientStates = {
  SPAWNED: 0,
  WALK_TO_RECEPTION: 1,
  WAIT_AT_RECEPTION: 2,
  WALK_TO_BED: 3,
  STAY_IN_BED: 4,
  WALK_HOME: 5
};

function Patient(x, y, health, wealth, sickness, gameState) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.wealth = wealth;
    this.sickness = sickness;
    this.diagnosed = false;
    this.isRich = (wealth > 80);
    this.inBed = null;
    this.targetBed = null;
    this.state = PatientStates.SPAWNED;
    this.animationOffset = rnd(9999);
    this.isHighlighted = false;

    this.movingVelocity = 4; // animation speed
    this.idleVelocity = 1;
    this.lastMoveDelta = {x: 0, y: 0};
    this.lastMoveTime = 0;
    this.directionFactor = 1;
    this.characterStateIndex = 0;
    this.characterFrameIndexes = [
        [1, 4, 5, 5, 5, 4, 1, 1], // idle
        [0, 1, 2, 3, 2, 1] // moving
    ];
    this.path = null;
    this.pathLength = 0;
    this.pathStartedTime = 0;
    this.image = Patient.images[this.isRich ? 3 : Math.floor(Math.random() * 2)];
    this.gameState = gameState;
}

Patient.load = function() {
    let sprites = [
      'patient1', // 0: Sick Man #1
      'patient2', // 1: Sick Man #2
      'patient3', // 2: Sick woman #1
      'patient4', // 3: Rich person
    ]
    Patient.images = sprites.map(sprite => loader.loadImage("./assets/" + sprite +".png", 4, 3));
};

Patient.prototype.update = function() {

    this.isHighlighted = this.gameState.closestPatientToDoctor === this;
    this.processPath();
    if (this.inBed) {
      this.directionFactor = 0;
    }
};

Patient.prototype.isAddressable = function() {

    return ((this.state === PatientStates.WAIT_AT_RECEPTION) || (this.state === PatientStates.STAY_IN_BED));
}

Patient.prototype.getFreePoint = function(points) {

    for (let i=0; i < points.length; i++) {
        if (!this.isOccupiedByPatient(points[i].x, points[i].y)) {
            return points[i];
        }
    }
    return null;
};

Patient.prototype.isOccupiedByPatient = function(x, y) {

    const patients = this.gameState.patients;
    for (let i=0; i < patients.length; i++) {
        const patient = patients[i];
        const target = patient.getMoveTarget();
        const currentPositionOccupiesCoords = this.isInSameTile(patient.x, patient.y, x + 0.5,  y + 0.5);
        const targetPositionOccupiesCoords = target !== null ? this.isInSameTile(target.x, target.y, x + 0.5, y + 0.5) : false;
        if (currentPositionOccupiesCoords || targetPositionOccupiesCoords) {
            return true;
        }
    }
};

Patient.prototype.isInSameTile = function(x1, y1, x2, y2) {

    const diffX = Math.abs(x1 - x2);
    const diffY = Math.abs(y1 - y2);
    return (diffX < 0.5) && (diffY < 0.5);
};

Patient.prototype.moveTo = function(targetX, targetY) {
    console.log('Moving to ', targetX, targetY);
    const path = this.gameState.level.findPath(this.x, this.y, targetX, targetY);
    this.planPath(path);
};

Patient.prototype.planPath = function(path) {

    if (this.path === null) {
        this.path = path;
        this.pathLength = 0;
        for (let i=0; i < path.length - 1; i++) {
            const currentPoint = path[i];
            const destPoint = path[i+1];
            const dist = vectorLength(currentPoint[0] - destPoint[0], currentPoint[1] - destPoint[1]);
            this.pathLength += dist;
            this.pathStartedTime = gameStage.time;
        }
    }
};

Patient.prototype.getPathProgress = function() {

    const millsecsForPath = this.pathLength / this.movingVelocity * 1000;
    const elapsedMillisecs = gameStage.time - this.pathStartedTime;
    const percentage = elapsedMillisecs / millsecsForPath;
    const floatingWaitpointIndex = this.path.length * percentage;
    let waypointIndex = Math.floor(floatingWaitpointIndex);
    waypointIndex = Math.min(this.path.length - 1, waypointIndex);
    const betweenPercent = floatingWaitpointIndex - Math.floor(floatingWaitpointIndex);

    return {waypointIndex: waypointIndex, betweenPercent: betweenPercent};
};

Patient.prototype.processPath = function() {

    if (this.path !== null) {
        const pos = this.getPathProgress();
        if (pos.waypointIndex < this.path.length - 1) {
            const elem1 = this.path[pos.waypointIndex];
            const elem2 = this.path[pos.waypointIndex + 1];
            const x = interpolate(elem1[0], elem2[0], pos.betweenPercent);
            const y = interpolate(elem1[1], elem2[1], pos.betweenPercent);
            this.updateCharacterPosition(x + 0.5, y + 0.5);
        } else {
            const elem = this.path[pos.waypointIndex];
            this.updateCharacterPosition(elem[0] + 0.5, elem[1] + 0.5);
            this.path = null;
            this.nextState();
        }

    }
};

Patient.prototype.nextState = function() {
    switch (this.state) {
        case PatientStates.WALK_TO_RECEPTION:
            this.state = PatientStates.WAIT_AT_RECEPTION;
            break;
        case PatientStates.WALK_TO_BED:
            this.enterBed(this.targetBed);
            break;
        case PatientStates.WALK_HOME:
            this.gameState.removePatient(this);
            break;
    }
};

Patient.prototype.updateCharacterPosition = function(x, y) {

    this.lastMoveDelta = {x: x - this.x, y: y - this.y};
    if ((this.lastMoveDelta.x !== 0) || (this.lastMoveDelta.y !== 0)) {
        this.x = x;
        this.y = y;
        this.characterStateIndex = 1;
        this.lastMoveTime = gameStage.time;
    }
};

Patient.prototype.getMoveTarget = function() {

    if ((this.path !== null) && (this.path.length > 0)) {
        const last = this.path[this.path.length - 1];
        return {x: last[0] + 0.5, y: last[1] + 0.5};
    }
    return null;
};

Patient.prototype.paint = function(ctx) {
    if (this.inBed) {
      return;
    }

    // Reset character state (idle, moving) shortly after walking ends
    if (gameStage.time - this.lastMoveTime > 100) {
        this.characterStateIndex = 0;
    }

    // mirror character depending on last movement direction
    this.directionFactor = this.lastMoveDelta.x !== 0 ? Math.sign(this.lastMoveDelta.x) : this.directionFactor;
    const frames = this.characterFrameIndexes[this.characterStateIndex];
    const frameCount = frames.length;
    const velocity = this.characterStateIndex === 0 ? this.idleVelocity : this.movingVelocity;

    // determine sequential frame index using game time
    const highlight = this.isHighlighted;
    const frameIndex = Math.floor((gameStage.time + this.animationOffset) / ((200 + this.animationOffset % 80)  / velocity)) % frameCount;
    const angle = 0; // wobble(gameStage.time, 5 + this.animationOffset/5000, this.animationOffset, 8) * 1;
    ctx.save();
    if (highlight) {
      ctx.shadowColor = '#e0b030';
      ctx.shadowBlur = 1;
    }
    for (var i = 0; i < (highlight ? 8 : 1); i++) {
      drawFrame(ctx, this.image, frames[frameIndex], this.x, this.y, angle, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
    }
    ctx.restore();
};

Patient.prototype.paintAttachedUI = function(ctx) {
  // Health bar
  const directionFactor = sgn(this.directionFactor);
  const px = 2 / 24;
  const x = Math.round(this.x * 24 + 4 * directionFactor) / 24, y = Math.round((this.y - 2 - px) * 24) / 24;
  const halfWidth = 6 / 24;
  const height = 2 / 24;
  ctx.fillStyle = "#00000000";
  ctx.fillRect(x - halfWidth - px, y - px, 2 * halfWidth + 2 * px, height);
  ctx.fillStyle = "white";
  ctx.fillRect(x - halfWidth, y, 2 * halfWidth, height);
  ctx.fillStyle = getHealthColor(this.health / 100);
  ctx.fillRect(x - halfWidth, y, 2 * halfWidth * this.health / 100, height);
  // Wealth
  ctx.font = "0.4px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#f0c040";
  const wealthLevel = this.wealth < 40 ? 1 : this.isRich ? 3 : 2;
  for (var i = 0; i < wealthLevel; i++) {
    ctx.fillText("$", x + (3 * i - 1) * px, y - 2 * px);
  }
};

Patient.prototype.enterBed = function(bed) {
    if (this.inBed) {
      throw new Error("Can't enter bed while already in bed. Noob.");
    }
    bed.occupy(this);
    this.inBed = bed;
    this.x = bed.positions[0].x + 0.5;
    this.y = bed.positions[0].y + 1.5;
    this.state = PatientStates.STAY_IN_BED;
};

Patient.prototype.getActions = function() {
  switch (this.state) {
    case PatientStates.WAIT_AT_RECEPTION:
      return ["Accept", "Send away"];
    case PatientStates.STAY_IN_BED:
      const list = ["Antibiotics", "Give Organ", "Release"];
      if (this.diagnosed) {
        list.unshift("Diagnose");
      }
      return list;
    default:
      return [];
  }
};

Patient.prototype.executeAction = function(action) {
  switch (this.state) {
      case PatientStates.SPAWNED: {
          switch (action) {
              case "Register":
                  const receptionPoint = this.getFreePoint(this.gameState.level.receptionPoints);
                  if (receptionPoint !== null) {
                      this.state = PatientStates.WALK_TO_RECEPTION;
                      this.moveTo(receptionPoint.x, receptionPoint.y);
                      return true;
                  }
                  return false;
              default:
                  throw new Error("Invalid action for spawned patient: " + action);
          }
      }
      case PatientStates.WAIT_AT_RECEPTION: {
      switch (action) {
        case "Accept":
          const bed = this.gameState.getRandomFreeBed();
          if (bed) {
            this.targetBed = bed;
            this.moveTo(bed.positions[0].x + 1, bed.positions[0].y);
            this.state = PatientStates.WALK_TO_BED;
          } else {
            // TODO Inform player this does not work
          }
          break;
        case "Send away":
          this.walkHome();
          break;
        default:
          throw new Error("Invalid action for waiting patient: " + action);
      }
      break;
    }
    case PatientStates.STAY_IN_BED: {
      switch (action) {
        case "Antibiotics":
          gameStage.transitionIn("syringe")
          break;
        case "Give Organ":
          gameStage.transitionIn("organ");
          break;
        case "Release":
          this.inBed.releasePatient();
          this.x = this.inBed.positions[0].x + 1;
          this.inBed = null;
          this.walkHome();
          break;
        default:
          throw new Error("Invalid action for patient in bed: " + action);
      }
      break;
    }
    default:
      throw new Error("Patient doesn't take actions while in state " + this.state);
  }
};

Patient.prototype.walkHome = function() {
  const endPoint = getRandomItem(this.gameState.level.spawnPoints);
  console.log(endPoint);
  this.moveTo(endPoint.x, endPoint.y);
  this.state = PatientStates.WALK_HOME;
};
