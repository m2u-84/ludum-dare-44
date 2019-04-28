
const PatientStates = {
  SPAWNED: 0,
  WALK_TO_RECEPTION: 1,
  WAIT_AT_RECEPTION: 2,
  WALK_TO_BED: 3,
  STAY_IN_BED: 4,
  WALK_HOME: 5
};

function Patient(x, y, health, wealth, sickness, gameState) {

    WalkingPerson.call(this, x, y, gameState);
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
}
inherit(Patient, WalkingPerson);

Patient.load = function() {

    Patient.image = loader.loadImage("./assets/patient1.png", 4, 3); // TODO: Random Patient Image?
};

Patient.prototype.update = function() {

    this.isHighlighted = this.gameState.closestPatientToDoctor === this;
    WalkingPerson.prototype.update.call(this);
    if (this.inBed) {
        this.directionFactor = 0;
    }
};

Patient.prototype.isAddressable = function() {

    return ((this.state === PatientStates.WAIT_AT_RECEPTION) || (this.state === PatientStates.STAY_IN_BED));
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

Patient.prototype.paint = function(ctx) {
    if (this.inBed) {
      return;
    }

    WalkingPerson.prototype.paint.call(this, ctx);
};

Patient.prototype.paintExecution = function(ctx, frameCount, velocity, frames) {

    // determine sequential frame index using game time
    const highlight = this.isHighlighted;
    const frameIndex = Math.floor((gameStage.time + this.animationOffset) / ((200 + this.animationOffset % 80)  / velocity)) % frameCount;
    const angle = 0; // wobble(gameStage.time, 5 + this.animationOffset/5000, this.animationOffset, 8) * 1;
    ctx.save();
    if (highlight) {
        ctx.shadowColor = '#e0b030';
        ctx.shadowBlur = 1;
    }
    for (let i = 0; i < (highlight ? 8 : 1); i++) {
        drawFrame(ctx, Patient.image, frames[frameIndex], this.x, this.y, angle, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
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
                  return this.seekHelp();
              default:
                  throw new Error("Invalid action for spawned patient: " + action);
          }
      }
      case PatientStates.WAIT_AT_RECEPTION: {
      switch (action) {
        case "Accept":
            this.hospitalize();
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
            this.releaseFromBed();
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

Patient.prototype.seekHelp = function() {

    const receptionPoint = this.getFreePoint(this.gameState.level.receptionPoints);
    if (receptionPoint !== null) {
        this.state = PatientStates.WALK_TO_RECEPTION;
        this.moveTo(receptionPoint.x, receptionPoint.y);
        return true;
    }
    return false;
};

Patient.prototype.hospitalize = function() {

    const bed = this.gameState.getRandomFreeBed();
    if (bed) {
        this.targetBed = bed;
        this.moveTo(bed.positions[0].x + 1, bed.positions[0].y + 1);
        this.state = PatientStates.WALK_TO_BED;
    } else {
        // TODO Inform player this does not work
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

Patient.prototype.releaseFromBed = function() {

    this.inBed.releasePatient();
    this.x = this.inBed.positions[0].x + 1;
    this.inBed = null;
};

Patient.prototype.walkHome = function() {
  const endPoint = getRandomItem(this.gameState.level.spawnPoints);
  console.log(endPoint);
  this.moveTo(endPoint.x, endPoint.y);
  this.state = PatientStates.WALK_HOME;
};
