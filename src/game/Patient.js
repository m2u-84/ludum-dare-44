
const PatientStates = {
  SPAWNED: 0,
  WALK_TO_RECEPTION: 1,
  WAIT_AT_RECEPTION: 2,
  WALK_TO_BED: 3,
  STAY_IN_BED: 4,
  WALK_HOME: 5,
  DEAD: 6,
  DIAGNOSING: 7,
  ASLEEP: 8
};

Patient.count = 0;

function Patient(x, y, health, wealth, sickness, gameState) {

    MovingObject.call(this, x, y, gameState);
    this.id = (++Patient.count);
    this.health = health;
    this.wealth = wealth;
    this.sickness = sickness;
    this.diagnosed = false;
    this.treated = false;
    this.wealthLevel = wealth >= 80 ? 3 : wealth >= 40 ? 2 : 1;
    this.isRich = (this.wealthLevel == 3);
    this.inBed = null;
    this.targetBed = null;
    this.healthDecrease = 2 * sickness.deadliness * (1 + rnd(0.5) - rnd(0.3)); // per second TODO: adjust
    this.healthDecrease = clump(this.healthDecrease, -0.3, 0.3);
    this.deathDuration = 500; // millisecs
    this.timeOfDeath = 0;
    this.state = PatientStates.SPAWNED;
    this.stateChangedTime = 0;
    this.patience = interpolate(60000, 120000, Math.random());
    this.animationOffset = rnd(9999);
    this.isHighlighted = false;
    this.imageIndex = this.isRich ? 3 : rndInt(0, 3);
    this.image = Patient.images[this.imageIndex];
    this.diagnosingUntil = 0;
    this.sleepTime = 0;
    this.gender = this.imageIndex === 3 ? 'female' : 'male';
    // Patients have takable organ initially, but not after player takes one
    this.hasOrgan = true; // TODO take organ away after organ taking minigame

    this.baseVelocity = this.movingVelocity;
    this.movingVelocity = computeMovingVelocity(this.baseVelocity, this.health);
}
inherit(Patient, MovingObject);

Patient.load = function() {
    let sprites = [
      'patient1', // 0: Sick Man #1
      'patient2', // 1: Sick Man #2
      'patient3', // 2: Sick woman #1
      'patient4', // 3: Rich person
    ];
    Patient.images = sprites.map(sprite => loader.loadImage("./assets/images/" + sprite + ".png", 4, 3));
};

Patient.prototype.update = function() {

    this.isHighlighted = this.gameState.closestPatientToDoctor === this;
    MovingObject.prototype.update.call(this);
    if (this.inBed) {
        this.directionFactor = 0;
    }
    updateHealth.call(this);
    if ((this.state === PatientStates.WAIT_AT_RECEPTION) && (gameStage.time - this.stateChangedTime > this.patience)) {
        this.executeAction(this.gameState.receptions[1]);
    }
    if ((this.state === PatientStates.STAY_IN_BED) && (this.isCured())) {
        this.executeAction(this.gameState.treatments.release);
    }
    if (this.state === PatientStates.DIAGNOSING && gameStage.time > this.diagnosingUntil) {
        this.nextState();
    }
    if (this.state === PatientStates.ASLEEP && gameStage.time > this.stateChangedTime + this.sleepTime) {
        this.nextState();
    }
};

Patient.prototype.setState = function(state) {
    this.state = state;
    this.stateChangedTime = gameStage.time;
};

Patient.prototype.recomputeVelocity = function() {

    this.movingVelocity = computeMovingVelocity(this.baseVelocity, this.health);
};

function updateHealth() {
    if (!this.isDead()) {
        const healthDecrease = this.healthDecrease * gameStage.timeDif / 1000;
        this.health -= healthDecrease;
        this.health = clamp(this.health, 0, 100);
        if (this.health <= 0) {
            this.die();
        }
    }
}

function computeMovingVelocity(baseVelocity, health) {

    return interpolate(0.5 * baseVelocity, baseVelocity, health / 100);
}

Patient.prototype.isAddressable = function() {
    return ((this.state === PatientStates.WAIT_AT_RECEPTION) || (this.state === PatientStates.STAY_IN_BED));
};

Patient.prototype.getAddressablePosition = function() {
  const result = {x: this.x, y: this.y};
  // Modify position when waiting at counter
  if (this.state == PatientStates.WAIT_AT_RECEPTION) {
    result.y -= 0.8;
  }
  return result;
};

Patient.prototype.isHealthy = function() {

    return this.health >= 100;
};

Patient.prototype.isCured = function() {

    return (this.isHealthy() && (this.healthDecrease <= 0));
};

Patient.prototype.isDead = function() {

    return this.state === PatientStates.DEAD;
};

Patient.prototype.getFreePoint = function(points) {

    let shuffled = points.slice();
    shuffle(shuffled);
    for (let i=0; i < shuffled.length; i++) {
        if (!this.isOccupiedByPatient(shuffled[i].x, shuffled[i].y)) {
            return shuffled[i];
        }
    }
    return null;
};

Patient.prototype.isOccupiedByPatient = function(x, y) {

    const patients = this.gameState.patients;
    for (let i=0; i < patients.length; i++) {
        const patient = patients[i];
        if (!patient.isDead()) {
            const target = patient.getMoveTarget();
            const currentPositionOccupiesCoords = this.isInSameTile(patient.x, patient.y, x + 0.5,  y + 0.5);
            const targetPositionOccupiesCoords = target !== null ? this.isInSameTile(target.x, target.y, x + 0.5, y + 0.5) : false;
            if (currentPositionOccupiesCoords || targetPositionOccupiesCoords) {
                return true;
            }
        }
    }
};

Patient.prototype.nextState = function() {
    switch (this.state) {
        case PatientStates.WALK_TO_RECEPTION:
            this.setState(PatientStates.WAIT_AT_RECEPTION);
            break;
        case PatientStates.WALK_TO_BED:
            this.enterBed(this.targetBed);
            break;
        case PatientStates.WALK_HOME:
            this.gameState.removePatient(this);
            break;
        case PatientStates.DIAGNOSING:
            this.setState(PatientStates.STAY_IN_BED);
            this.diagnosed = true;
            break;
        case PatientStates.ASLEEP:
            this.setState(PatientStates.STAY_IN_BED);
            break;
    }
};

Patient.prototype.paint = function(ctx) {
    if (this.inBed) {
      return;
    }

    MovingObject.prototype.paint.call(this, ctx);
};

Patient.prototype.paintExecution = function(ctx, velocity, frameIndexes) {

    const frameCount = frameIndexes.length;
    if (frameCount === 0) {
        return;
    }

    if (!this.isDead()) {
        // determine sequential frame index using game time
        const highlight = this.isHighlighted;
        const frameIndex = Math.floor((gameStage.time + this.animationOffset) / ((200 + this.animationOffset % 80)  / velocity)) % frameCount;
        const angle = 0; // wobble(gameStage.time, 5 + this.animationOffset/5000, this.animationOffset, 8) * 1;
        ctx.save();
        if (highlight) {
            ctx.shadowColor = '#009cff';
            ctx.shadowBlur = 1;
        }
        for (let i = 0; i < (highlight ? 8 : 1); i++) {
            drawFrame(ctx, this.image, frameIndexes[frameIndex], this.x, this.y, angle, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
        }
        ctx.restore();
    } else {
        let dyingPercentage = (gameStage.time - this.timeOfDeath) / this.deathDuration;
        dyingPercentage = Math.min(1, dyingPercentage);
        const frameIndex = Math.floor(dyingPercentage * (frameCount  - 1));
        // hacked angle to improve dying animation without too many sprites
        let angle = Math.PI * (1/2 - 1/7) * dyingPercentage; // 1/7 comes from PI/7
        if (frameIndex > 2) {
            angle += Math.PI / 7;
        }
        drawFrame(ctx, this.image, frameIndexes[frameIndex], this.x - dyingPercentage * this.directionFactor, this.y, this.directionFactor * angle, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
    }
};

Patient.prototype.getCharacterFrames = function(isMoving) {

    if (this.isDead()) {
        return [1, 6, 6, 7, 7];
    } else {
        return isMoving ? [0, 1, 2, 3, 2, 1] : [1, 4, 5, 5, 5, 4, 1, 1];
    }
};

Patient.prototype.paintAttachedUI = function(ctx) {

    if (!this.isDead()) {

        // Health bar
        const directionFactor = sgn(this.directionFactor);
        const px = 2 / 24;
        const x = Math.round(this.x * 24 + 4 * directionFactor) / 24,
            y = Math.round((this.y - 2 - px + (this.inBed ? 9/24 : 0)) * 24) / 24;
        const halfWidth = 6 / 24;
        const height = 2 / 24;
        ctx.fillStyle = "#00000000";
        ctx.fillRect(x - halfWidth - px, y - px, 2 * halfWidth + 2 * px, height);
        ctx.fillStyle = "white";
        ctx.fillRect(x - halfWidth, y, 2 * halfWidth, height);
        ctx.fillStyle = getHealthColor(this.health / 100);
        ctx.fillRect(x - halfWidth, y, 2 * halfWidth * this.health / 100, height);
        // Wealth
        /* ctx.font = "0.4px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#f0c040";
        const wealthLevel = this.wealth < 40 ? 1 : this.isRich ? 3 : 2;
        for (var i = 0; i < wealthLevel; i++) {
          ctx.fillText("$", x + (3 * i - 1) * px, y - 2 * px);
        } */
    }
};

Patient.prototype.getActions = function() {
  const treatments = this.gameState.treatmentArray.slice();
  if (this.diagnosed) {
      treatments.sort((t1, t2) => t2.getBaseSafetyFor(this.sickness) - t1.getBaseSafetyFor(this.sickness))
  } else {
    treatments.sort((t1, t2) => this.getTreatmentPrice(t2) - this.getTreatmentPrice(t1));
  }
  switch (this.state) {
    case PatientStates.WAIT_AT_RECEPTION:
      return this.gameState.receptions;
    case PatientStates.STAY_IN_BED:
      const list = treatments;
      if (!this.diagnosed) {
        list.unshift("Diagnose");
      } else {
        // Move best diagnosis to top
        moveToTop(list, this.sickness.treatment);
      }
      return list;
    default:
      return [];
  }
};

Patient.prototype.executeAction = function(action) {
  const treatments = this.gameState.treatments;
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
      switch (action.name) {
        case "Accept":
            this.hospitalize();
            break;
        case "Send Away":
            this.walkHome();
            break;
        default:
            throw new Error("Invalid action for waiting patient: " + action);
      }
      break;
    }
    case PatientStates.STAY_IN_BED: {
      switch (action) {
        case "Diagnose":
          this.diagnosingUntil = gameStage.time + rndInt(3000, 15000); // TODO change to ~7-40 seconds
            this.setState(PatientStates.DIAGNOSING);
          break;

        case treatments.antibiotics:
          gameStage.transitionIn("syringe", undefined, {patient: this});
          break;

        case treatments.drugs:
          // TODO: replace this with minigame
          this.healthDecrease = -treatments.drugs.effects[this.sickness.name];
          console.log("healthDecrease", this.healthDecrease);
          break;

        case treatments.fixLeg:
          // TODO: replace this with minigame
          this.healthDecrease = -treatments.fixLeg.effects[this.sickness.name];
          console.log("healthDecrease", this.healthDecrease);
          gameStage.transitionIn("fracture", undefined, {patient: this});
          break;

        case treatments.organ:
          gameStage.transitionIn("organ", undefined, {patient: this});
          break;

        case treatments.placeboSurgery:
          // TODO: replace this with minigame
          this.healthDecrease = -treatments.placeboSurgery.effects[this.sickness.name];
          console.log("healthDecrease", this.healthDecrease);
          break;

        case treatments.release:
          this.releaseFromBed();
          this.walkHome();
          break;

        case treatments.surgery:
          // TODO: replace this with minigame
          this.healthDecrease = -treatments.surgery.effects[this.sickness.name];
          console.log("healthDecrease", this.healthDecrease);
          break;

        case treatments.takeOrgan:
          // TODO: replace this with minigame
          this.health = 0;
          this.gameState.hospital.organs = this.gameState.hospital.organs + 1;
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
        this.setState(PatientStates.WALK_TO_RECEPTION);
        this.moveTo(receptionPoint.x, receptionPoint.y, () => this.nextState());
        return true;
    }
    return false;
};

Patient.prototype.hospitalize = function() {

    const bed = this.gameState.getRandomFreeBed();
    if (bed) {
        this.targetBed = bed;
        const visitorPos = bed.getClosestVisitorPoint(this.x, this.y);
        this.moveTo(visitorPos.x, visitorPos.y, () => this.nextState());
        this.setState(PatientStates.WALK_TO_BED);
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
    this.setState(PatientStates.STAY_IN_BED);
    this.targetBed = null;
};

Patient.prototype.releaseFromBed = function() {

    this.inBed.releasePatient();
    this.x = this.inBed.positions[0].x + 1;
    this.inBed = null;
};

Patient.prototype.walkHome = function() {
  const endPoint = getRandomItem(this.gameState.level.spawnPoints);
  this.moveTo(endPoint.x, endPoint.y, () => this.nextState());
    this.setState(PatientStates.WALK_HOME);
};

Patient.prototype.die = function() {
    if (!this.isDead()) {
        this.health = 0;
        this.setState(PatientStates.DEAD);
        this.finishPath();
        setTimeout(() => {
            gameStage.cashflowFeed.addText("Lost $250 due to deceased patient");
            this.gameState.hospital.loseRevenue(250, this.x, this.y);
        }, this.deathDuration);
        this.timeOfDeath = gameStage.time;
    }
};

Patient.prototype.getTreatmentPrice = function(treatment) {
  const hospitalCosts = treatment.costsForHospital;
  const patientBasePrice = treatment.costsForPatient;
  const multiplier = (this.wealth / 100);
  const exactPrice = patientBasePrice * multiplier - hospitalCosts;
  const price = 10 * Math.round(exactPrice / 10);
  return price;
};

Patient.prototype.addEffect = function(regeneration, absolute, treatment) {
    // Mark patient as treated (does not mean cured, only that doctor did something with patient)
    this.treated = true;
    // Single intervention can in extreme cases fully kill or cure a patient, but usually has relatively small immediate effect
    // thus value change has maximum of 50% of max hp, but exponent of 2 pulls values closer towards 0
    // console.log("Health starts at ", this.health, " deg at ", this.healthDecrease);
    const maxHealth = (this.health + 100) / 2;
    this.health = clamp(this.health + 50 * sgnPow(absolute, 2), 0, maxHealth);
    // console.log("Applying effect ", regeneration, absolute, " setting health to ", this.health);
    if (this.health <= 0) {
        this.die();
    } else {
        // Apply 50% damping to keep de/regeneration relatively close to 0 even after many actions
        // thus recent actions will always have bigger effect on patient's well-being than long term history
        this.healthDecrease = 0.5 * this.healthDecrease - 3 * regeneration - 0.2;
        this.healthDecrease = clump(this.healthDecrease, -0.3, 0.3, 0.25);
        // console.log("Setting health decrease to ", this.healthDecrease);
    }
    // Change state
    this.beginSleep(treatment.sleepTime);
};

Patient.prototype.beginSleep = function(time) {
    this.sleepTime = time;
    this.setState(PatientStates.ASLEEP);
};
