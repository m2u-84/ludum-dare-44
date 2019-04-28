
const FacilityManagerStates = {
  SPAWNED: 0,
  WALK_TO_STOREROOM: 1,
  WAIT_IN_STOREROOM: 2,
  WALK_TO_CORPSE: 3,
  CARRY_CORPSE_TO_PILE: 4,
  BURN_PILE: 5,
  WALK_BACK_TO_STOREROOM: 6
};

function FacilityManager(x, y, gameState) {

    WalkingPerson.call(this, x, y, gameState);
    this.state = FacilityManagerStates.SPAWNED;
    this.image = gameState.doctor.isMale ? Doctor.images[1] : Doctor.images[0];
    this.fireIsBurning = false;
}
inherit(FacilityManager, WalkingPerson);

FacilityManager.load = function() {

    FacilityManager.imageFire = loader.loadImage("./assets/dumpsterfire.png", 4, 1);
    FacilityManager.soundContainerDump = loader.loadAudio({src: "./assets/audio/sounds/container-dump/container-dump.mp3"});
    FacilityManager.soundBurn = loader.loadAudio({src: "./assets/audio/sounds/burning/burning.mp3"});
};

FacilityManager.prototype.update = function() {

    WalkingPerson.prototype.update.call(this);
};

FacilityManager.prototype.nextState = function() {

    switch (this.state) {
        case FacilityManagerStates.SPAWNED:
            this.state = FacilityManagerStates.WALK_TO_STOREROOM;
            this.walkToStoreRoom();
            break;
        case FacilityManagerStates.WALK_TO_STOREROOM:
            this.state = FacilityManagerStates.WAIT_IN_STOREROOM;
            this.waitForCorpse();
            break;
        case FacilityManagerStates.WAIT_IN_STOREROOM:
            this.state = FacilityManagerStates.WALK_TO_CORPSE;
            this.walkToCorpse();
            break;
        case FacilityManagerStates.WALK_TO_CORPSE:
            this.state = FacilityManagerStates.CARRY_CORPSE_TO_PILE;
            this.carryCorpseToPile();
            break;
        case FacilityManagerStates.CARRY_CORPSE_TO_PILE:
            this.state = FacilityManagerStates.BURN_PILE;
            this.burnPile();
            break;
        case FacilityManagerStates.BURN_PILE:
            if (this.checkIfCorpseAvailable()) {
                this.state = FacilityManagerStates.WALK_TO_CORPSE;
                this.walkToCorpse();
            } else {
                this.state = FacilityManagerStates.WALK_BACK_TO_STOREROOM;
                this.walkBackToStoreRoom();
            }
            break;
        case FacilityManagerStates.WALK_BACK_TO_STOREROOM:
            this.state = FacilityManagerStates.WALK_TO_STOREROOM;
            this.nextState();
    }
};

FacilityManager.prototype.paint = function(ctx) {

    if (this.fireIsBurning) {
        const frame = Math.floor(gameStage.time / 100) % 4;
        const firePoint = this.gameState.level.firePoint;
        drawFrame(ctx, FacilityManager.imageFire, frame, firePoint.x, firePoint.y + 1, 0, 1 / 24, 1 / 24, 0, 1);
    }
    WalkingPerson.prototype.paint.call(this, ctx);
};

FacilityManager.prototype.paintExecution = function(ctx, velocity, frameIndexes) {

    // determine sequential frame index using game time
    const frameCount = frameIndexes.length;
    const frameIndex = Math.floor(gameStage.time / (200 / velocity)) % frameCount;
    drawFrame(ctx, this.image, frameIndexes[frameIndex], this.x, this.y, 0, this.directionFactor * 1 / 24, 1 / 24, 0.5, 0.98);
};

FacilityManager.prototype.getCharacterFrames = function(isMoving) {

    if (this.isCarryingCorpse()) {
        return [8, 9, 10, 11]
    } else {
        return isMoving ? [0, 1, 2, 3, 2, 1] : [1, 4, 5, 5, 5, 4, 1, 1];
    }
};

FacilityManager.prototype.isCarryingCorpse = function() {

    return this.state === FacilityManagerStates.CARRY_CORPSE_TO_PILE;
};

FacilityManager.prototype.walkToStoreRoom = function() {

    const moveTarget = this.gameState.level.facilityManagerWaitPoint;
    this.moveTo(moveTarget.x, moveTarget.y, () => this.nextState());
};

FacilityManager.prototype.waitForCorpse = function() {

    this.startWaitingTime(3000, () => {
        this.startWaiting(this.checkIfCorpseAvailable,
            () => this.nextState());
    })
};

FacilityManager.prototype.checkIfCorpseAvailable = function() {

    const corpse = this.getFirstCorpse();
    return corpse != null;
};

FacilityManager.prototype.getFirstCorpse = function() {

    const patients = this.gameState.patients;
    for (let i=0; i<patients.length; i++) {
        if (patients[i].isDead()) {
            return patients[i];
        }
    }
    return null;
};

FacilityManager.prototype.walkToCorpse = function() {

    const corpse = this.getFirstCorpse();
    if (corpse) {
        let pos = {x: null, y: null};
        if (corpse.inBed) {
            const bed = corpse.inBed;
            const xl = bed.positions[0].x - 1;
            const xr = bed.positions[0].x + 1;
            const y = bed.positions[0].y;

            pos.y = y;
            if (this.isFreeTile(xl, y)) {
                pos.x = xl;
            } else if (this.isFreeTile(xr, y)) {
                pos.x = xr;
            } else {
                this.isFreeTile(xl, y);
                throw new Error("no non-blocked space around bed");
            }
        } else {
            pos.x = corpse.x;
            pos.y = corpse.y;
        }
        this.moveTo(pos.x, pos.y, () => {
            this.removeCorpse(corpse);
            this.nextState();
        });
    }
};

FacilityManager.prototype.removeCorpse = function(corpse) {

    if (corpse.inBed) {
        corpse.releaseFromBed();
    }
    this.gameState.patients.remove(corpse);
};

FacilityManager.prototype.carryCorpseToPile = function() {

    const pilePoint = this.gameState.level.pilePoint;
    if (pilePoint != null) {
        this.moveTo(pilePoint.x, pilePoint.y, () => this.nextState())
    }
};

FacilityManager.prototype.burnPile = function() {

    FacilityManager.soundContainerDump.play();
    // burn randomly every three times
    if (Math.floor(Math.random() * 3) === 0) {
        this.startWaitingTime(1000, () => {
            this.fireIsBurning = true;
            FacilityManager.soundBurn.play();
            this.startWaitingTime(3000, () => {
                this.fireIsBurning = false;
                this.nextState();
            });
        });
    } else {
        this.nextState();
    }
};

FacilityManager.prototype.walkBackToStoreRoom = function() {

    this.walkToStoreRoom();
};
