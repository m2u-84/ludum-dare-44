
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
    this.inBed = null;
    this.targetBed = null;
    this.state = PatientStates.SPAWNED;
    this.animationOffset = rnd(9999);

    this.movingVelocity = 2; // animation speed
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
    this.pathDestReachedCallback = null;
    this.lastPathProcessTime = 0;
    this.pathSmoothness = 10; // TODO 50

    this.gameState = gameState;
}

Patient.load = function() {

    Patient.image = loader.loadImage("./assets/patient1.png", 4, 3); // TODO: Random Patient Image?
};

Patient.prototype.update = function() {

    this.processPath();
};

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
        this.path = [];
        for (let i=0; i < path.length - 1; i++) {
            const currentPoint = path[i];
            const destPoint = path[i+1];
            const steps = this.pathSmoothness;
            for (let step=0; step < steps; step++) {
                let point = [0.5 + interpolate(currentPoint[0], destPoint[0], step / steps),
                    0.5 + interpolate(currentPoint[1], destPoint[1], step / steps)];
                this.path.push(point);
            }
        }
        this.lastPathProcessTime = 0;
    }
};

Patient.prototype.processPath = function() {

    if (this.path !== null) {
        if (this.path.length === 0) {
            this.path = null;
            if (this.pathDestReachedCallback !== null) {
                this.pathDestReachedCallback(this);
            }
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
            return;
        }
        const currentTime = gameStage.time;
        if (currentTime - this.lastPathProcessTime > 25 / this.pathSmoothness) {
            this.lastPathProcessTime = currentTime;

            const elem = this.path[0];
            this.path.shift();
            this.updateCharacterPosition(elem[0], elem[1]);
        }

    }
};

Patient.prototype.updateCharacterPosition = function(x, y) {

    this.lastMoveDelta = {x: x - this.x, y: y - this.y};
    this.x = x;
    this.y = y;
    this.characterStateIndex = 1;
    this.lastMoveTime = gameStage.time;
};

Patient.prototype.getMoveTarget = function() {

    if ((this.path !== null) && (this.path.length > 0)) {
        const last = this.path[this.path.length - 1];
        return {x: last[0], y: last[1]};
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
    const highlight = false;
    const frameIndex = Math.floor((gameStage.time + this.animationOffset) / ((200 + this.animationOffset % 80)  / velocity)) % frameCount;
    const angle = 0; // wobble(gameStage.time, 5 + this.animationOffset/5000, this.animationOffset, 8) * 1;
    ctx.save();
    if (highlight) {
      ctx.shadowColor = '#e0b030';
      ctx.shadowBlur = 1;
    }
    for (var i = 0; i < (highlight ? 8 : 1); i++) {
      drawFrame(ctx, Patient.image, frames[frameIndex], this.x, this.y, angle, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
    }
    ctx.restore();
};

Patient.prototype.enterBed = function(bed) {
    if (this.inBed) {
      throw new Error("Can't enter bed while already in bed. Noob.");
    }
    bed.occupy(this);
    this.inBed = bed;
    this.x = bed.positions[0].x;
    this.y = bed.positions[0].y;
    this.state = PatientStates.STAY_IN_BED;
};

Patient.prototype.getActions = function() {
  switch (this.state) {
    case PatientStates.WAIT_AT_RECEPTION:
      return ["Accept", "Send away"];
    case PatientStates.STAY_IN_BED:
      const list = ["Antibiotics", "Give Organ"];
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
          this.moveTo(0, 15); // TODO use actual exits of level
          this.state = PatientStates.WALK_HOME;
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
        default:
          throw new Error("Invalid action for patient in bed: " + action);
      }
      break;
    }
    default:
      throw new Error("Patient doesn't take actions while in state " + this.state);
  }
};
