
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

const PatientMoods = {
    NONE: -1,
    BETTER: 0,
    WORSE: 1,
    CURED: 2,
    DEAD: 3,
    ANGRY: 4
};

function Patient(x, y, health, wealth, sickness, gameState) {

    MovingObject.call(this, x, y, gameState);
    this.id = (++gameState.stats.patientCount);
    this.health = health;
    this.wealth = wealth;
    this.sickness = sickness;
    this.diagnosed = false;
    this.treated = false;
    this.cured = false;
    this.wealthLevel = wealth >= 80 ? 3 : wealth >= 40 ? 2 : 1;
    this.isRich = (this.wealthLevel == 3);
    this.inBed = null;
    this.targetBed = null;
    this.healthDecrease = 1.5 * sickness.deadliness * (1 + rnd(0.5) - rnd(0.3)); // per second
    this.healthDecrease = 0.75 * clump(this.healthDecrease, -0.3, 0.3);
    this.deathDuration = 500; // millisecs
    this.timeOfDeath = 0;
    this.state = PatientStates.SPAWNED;
    this.stateChangedTime = 0;
    this.patience = interpolate(60000, 120000, Math.random());
    this.animationOffset = rnd(9999);
    this.isHighlighted = false;
    this.imageIndex = Patient.getImage(this.isRich);
    this.image = Patient.images[this.imageIndex];
    this.diagnosingUntil = 0;
    this.sleepTime = 0;
    this.isMale = this.imageIndex === 2 ? false : true;
    // Patients have takable organ initially, but not after player takes one
    this.hasOrgan = true;
    this.mood = PatientMoods.NONE;
    this.moodIconDuration = 4000;
    this.moodStartTime = 0;
    this.moodAnimations = {
        0: [0,1,2,3],
        1: [4,5,6,7],
        2: [8,9,10,11],
        3: [12,13,14,15],
        4: [16,17,18,19]
    }

    this.baseVelocity = this.movingVelocity;
    this.movingVelocity = computeMovingVelocity(this.baseVelocity, this.health);
}
inherit(Patient, MovingObject);

Patient.load = function() {
    const ASSETS_BASE_PATH = './assets/';
    const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    let sprites = [
      'patient1', // 0: Sick Man #1
      'patient2', // 1: Sick Man #2
      'patient3', // 2: Sick woman #1
      'patient4', // 3: Rich person
    ];

    Patient.images = sprites.map(sprite => loader.loadImage(IMAGES_BASE_PATH + sprite + '.png', 4, 3));
    Patient.indicatorImage = loader.loadImage(IMAGES_BASE_PATH + "indicator.png");
    Patient.moodImage = loader.loadImage("./assets/images/mood.png", 4, 5);
    Patient.exclamationImage = loader.loadImage("./assets/images/attention.png", 5, 1);
    Patient.exclamationFrames = [0, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 2, 2, 1];

    /**
     * Todo: Load separated sprite sets (head, shirt, legs) and put them together to create
     * a wide variety of patient appereances.
     **/ 

    // const dynSprites = {
    //     heads: [
    //         'patient_head0',
    //         'patient_head1',
    //         'patient_head2',
    //         'patient_head3'
    //     ],
    //     shirts: [
    //         'patient_shirt0'
    //     ],
    //     legs: [
    //         'patient_leg0'
    //     ]
    // }

    // Patient.headImages  = dynSprites.heads.map(sprite => loader.loadImage(IMAGES_BASE_PATH + sprite + '.png', 4, 3));
    // Patient.shirtImages = dynSprites.shirts.map(sprite => loader.loadImage(IMAGES_BASE_PATH + sprite + '.png', 4, 3));
    // Patient.legImages   = dynSprites.legs.map(sprite => loader.loadImage(IMAGES_BASE_PATH + sprite + '.png', 4, 3));

    Patient.soundsDying = {
        male: [
            loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/dying/dying-male-1.mp3'}),
            loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/dying/dying-male-2.mp3'}),
            loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/dying/dying-male-3.mp3'})
        ],
        female: [
            loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/dying/dying-female-1.mp3'}),
            loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/dying/dying-female-2.mp3'}),
            loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/dying/dying-female-3.mp3'})
        ]
    }
};

Patient.lastImages = [];
Patient.getImage = function(rich) {
    if (rich) { return 3; }
    // Not rich -> randomize
    let index = rndInt(0, 3);
    let count = 0;
    while (Patient.lastImages.includes(index) && count++ < 100) {
        index = rndInt(0, 3);
    }
    // Push to array
    if (Patient.lastImages.length >= 1) {
        Patient.lastImages.splice(0, 1);
    }
    Patient.lastImages.push(index);
    return index;
};

Patient.prototype.update = function() {

    this.isHighlighted = this.gameState.closestPatientToDoctor === this;
    MovingObject.prototype.update.call(this);
    if (this.inBed) {
        this.directionFactor = {x: 0, y: 0};
    }
    updateHealth.call(this);
    if ((this.state === PatientStates.WAIT_AT_RECEPTION) && (gameStage.time - this.stateChangedTime > this.patience)) {
        this.executeAction(this.gameState.receptions[1]);
    } else if ((this.state === PatientStates.STAY_IN_BED) && (this.isCured())) {
        gameStage.cashflowFeed.addText("Release happily rewarded with $500", "gold");
        this.gameState.hospital.giveRevenue(500, this.x, this.y);
        this.executeAction(this.gameState.releaseTreatment);
        this.setMood(PatientMoods.CURED);
    } else if (this.state === PatientStates.DIAGNOSING && gameStage.time > this.diagnosingUntil) {
        this.nextState();
    } else if (this.state === PatientStates.ASLEEP && gameStage.time > this.stateChangedTime + this.sleepTime) {
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

Patient.prototype.setMood = function(mood) {
    this.mood = mood;
    this.moodStartTime = gameStage.time;
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
            this.gameState.stats.diagnoses++;
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
            drawFrame(ctx, this.image, frameIndexes[frameIndex], this.x, this.y, angle, this.directionFactor.x * 1/24, 1/24, 0.5, 0.98);
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
        drawFrame(ctx, this.image, frameIndexes[frameIndex], this.x - dyingPercentage * this.directionFactor.x, this.y, this.directionFactor.x * angle, this.directionFactor.x * 1/24, 1/24, 0.5, 0.98);
    }
};

Patient.prototype.getCharacterFrames = function(isMoving) {

    if (this.isDead()) {
        return [1, 6, 6, 7, 7];
    } else {
        if (isMoving) {
            return [0, 1, 2, 3, 2, 1];
        } else {
            if (this.health < 25) return [1, 4, 5, 4];
            if (this.health < 50) return [1, 4, 5, 5, 4, 1];
            return [1, 4, 5, 5, 5, 5, 4, 1, 1, 1];
        }
    }
};

Patient.prototype.paintAttachedUI = function(ctx) {

    // Dynamic coordinates above the patient
    let x;
    let y;
    const px = 2 / 24;

    if (!this.isDead() || this.mood != '') {
        const offX = gameStage.active ? this.shiverX : 0
        const offY = gameStage.active ? this.shiverY : 0;
        const directionFactor = sgn(this.directionFactor.x);
        x = Math.round(this.x * 24 + 4 * directionFactor + offX) / 24;
        y = Math.round((this.y - 2 - px + (this.inBed ? 9/24 : 0)) * 24 + offY) / 24;
    }

    if (!this.isDead()) {

        if (this.health < 20 && this.inBed) {
            if (this.health < 5) {
                this.shiverX = rndInt(-1, 2);
                this.shiverY = rndInt(-1, 2);
            } else if (this.health < 10) {
                this.shiverX = rndInt(-1, 2);
                this.shiverY = rndInt(-1, 1);
            } else if (this.health < 15) {
                this.shiverX = rndInt(-1, 2);
                this.shiverY = 0;
            } else {
                this.shiverX = rndInt(-1, 1);
                this.shiverY = 0;
            }
        } else {
            // Shiver effect is set by bed when patient is almost dead
            this.shiverX = 0;
            this.shiverY = 0;
        }

        // Only show health bar if patient is not cured
        if (!this.isCured()) {

            /**
             * Exclamation Mark
             **/
            if(this.state == PatientStates.WAIT_AT_RECEPTION || this.state == PatientStates.STAY_IN_BED){
                const exclamationFrame = getArrayFrame(gameStage.time / 50, Patient.exclamationFrames);
                drawFrame(ctx, Patient.exclamationImage, exclamationFrame, x, y - (1/24), 0, 1/24, 1/24, 0.5, 1);
            }

            /**
             * Health bar
             **/ 
            const halfWidth = 6 / 24;
            const height = 2 / 24;
            // Health bar background
            ctx.fillStyle = "white";
            ctx.fillRect(x - halfWidth, y, 2 * halfWidth, height);
            // Direction indicator
            const frame = absMod( Math.round(-this.healthDecrease * gameStage.time / 200), Patient.indicatorImage.height);
            ctx.drawImage(Patient.indicatorImage, 0, frame, 24 * 2 * halfWidth, 1, x - halfWidth, y, 2 * halfWidth, px);
            // Actual health bar; use power > 0 to make hp seem lower than they are, for a more tense/dramatic experience
            const displayedHealth = Math.pow(this.health / 100, 1.5);
            ctx.fillStyle = getHealthColor(displayedHealth);
            ctx.fillRect(x - halfWidth, y, 2 * halfWidth * displayedHealth, height);
        }
    }

    // Draw mood icon
    if (this.mood != PatientMoods.NONE) {
        const moodFrame = getArrayFrame(gameStage.time / 200, this.moodAnimations[this.mood]);
        drawFrame(ctx, Patient.moodImage, moodFrame, x - (15/24), y + px, 0, 1/24, 1/24, 0.5, 0.5, 1);
        if (gameStage.time - this.moodStartTime >=  this.moodIconDuration) this.mood = PatientMoods.NONE;
    }
};

Patient.prototype.getActions = function() {
  const treatments = this.gameState.treatmentArray.slice();
  /* if (this.diagnosed) {
      treatments.sort((t1, t2) => t2.getBaseSafetyFor(this.sickness) - t1.getBaseSafetyFor(this.sickness))
  } else {
    treatments.sort((t1, t2) => this.getTreatmentPrice(t2) - this.getTreatmentPrice(t1));
  } */
  switch (this.state) {
    case PatientStates.WAIT_AT_RECEPTION:
      return this.gameState.receptions.slice();
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
        case "Admit Patient":
            this.hospitalize();
            this.gameState.stats.patientsAccepted++;
            this.gameState.hospital.giveRevenue(this.getTreatmentPrice(this.gameState.acceptReception), this.x, this.y);
            break;
        case "Send Away":
            this.walkHome();
            this.gameState.stats.patientsRejected++;
            this.gameState.hospital.giveRevenue(this.getTreatmentPrice(this.gameState.rejectReception), this.x, this.y);
            this.setMood(PatientMoods.ANGRY);
            break;
        default:
            throw new Error("Invalid action for waiting patient: " + action);
      }
      break;
    }
    case PatientStates.STAY_IN_BED: {
      switch (action) {
        case "Diagnose":
          this.diagnosingUntil = gameStage.time + 1000 * rndInt(7, 40);
            this.setState(PatientStates.DIAGNOSING);
          break;
        case treatments.antibiotics:
          gameStage.transitionIn("syringe", undefined, {patient: this});
          break;
        case treatments.fixLeg:
          gameStage.transitionIn("fracture", undefined, {patient: this});
          break;
        case treatments.organ:
          gameStage.transitionIn("organ", undefined, {patient: this});
          break;
        case treatments.placeboSurgery:
            gameStage.transitionIn("placebo", undefined, {patient: this});
          break;
        case this.gameState.releaseTreatment:
          this.releaseFromBed();
          this.walkHome();
          this.gameState.stats.patientsCured++;
          break;
        case treatments.takeOrgan:
          gameStage.transitionIn("takeOrgan", undefined, {patient: this});
          break;
        case treatments.drugs:
          gameStage.transitionIn("drug", undefined, {patient: this});
          break;
        /* case treatments.surgery:
          // ...replace this with minigame
          this.healthDecrease = -treatments.surgery.effects[this.sickness.name];
          console.log("healthDecrease", this.healthDecrease);
          break; */

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
        // Inform player this does not work? No, action is disabled in menu, all good
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
    if (!this.inBed) {
        console.error("Patient " + this.id + " tried to leave bed without being in one");
        return;
    }
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
        this.gameState.stats.patientsDied++;
        this.health = 0;
        this.setState(PatientStates.DEAD);
        this.finishPath();
        this.setMood(PatientMoods.DEAD);

        Patient.soundsDying[this.isMale ? 'male' : 'female'][rndInt(0, 3)].play();

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
  if (hospitalCosts == null || patientBasePrice == null) { return null; }
  const multiplier = (this.wealth / 100);
  const exactPrice = patientBasePrice * multiplier - hospitalCosts;
  const price = 10 * Math.round(exactPrice / 10);
  return price;
};

Patient.prototype.addEffect = function(regeneration, absolute, treatment) {
    // Mark patient as treated (does not mean cured, only that doctor did something with patient)
    this.treated = true;
    if (this.sickness && treatment == this.sickness.treatment && regeneration > 0 && absolute > 0) {
        // No sickness anymore
        this.cured = true;
        this.setMood(PatientMoods.BETTER);
    }
    // Single intervention can in extreme cases fully kill or cure a patient, but usually has relatively small immediate effect
    // thus value change has maximum of 50% of max hp, but exponent of 2 pulls values closer towards 0
    // console.log("Health starts at ", this.health, " deg at ", this.healthDecrease);
    const maxHealth = (this.health + 100) / 2;
    this.health = clamp(this.health + 50 * sgnPow(absolute, 2), 0, maxHealth);
    // console.log("Applying effect ", regeneration, absolute, " setting health to ", this.health);
    if (this.health <= 0 || rnd() < treatment.getRiskOfDeath()) {
        this.die();
        gameStage.cashflowFeed.addText("Sadly the patient died from complications", "red");
        return;
    } else {
        // Apply 50% damping to keep de/regeneration relatively close to 0 even after many actions
        // thus recent actions will always have bigger effect on patient's well-being than long term history
        if (regeneration >= 0) this.setMood(PatientMoods.BETTER); else this.setMood(PatientMoods.WORSE);
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
