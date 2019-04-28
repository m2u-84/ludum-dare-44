
const FacilityManagerStates = {
  SPAWNED: 0,
  WALK_TO_STOREROOM: 1,
  WAIT_IN_STOREROOM: 2,
  WALK_TO_CORPSE: 3,
  CARRY_CORPSE_TO_PILE: 4,
  BURN_PILE: 5
};

function FacilityManager(x, y, gameState) {

    WalkingPerson.call(this, x, y, gameState);
    this.state = FacilityManagerStates.SPAWNED;
}
inherit(FacilityManager, WalkingPerson);

FacilityManager.load = function() {

    FacilityManager.image = loader.loadImage("./assets/doctor_m.png", 4, 3); // TODO: use FacilityManager image
};

FacilityManager.prototype.update = function() {

    WalkingPerson.prototype.update.call(this);
/* adjust for storeroom
    if (this.inBed) {
        this.directionFactor = 0;
    }*/
};

FacilityManager.prototype.pathFinished = function() {

    this.nextState();
};

FacilityManager.prototype.nextState = function() {

    switch (this.state) {
        case FacilityManagerStates.SPAWNED:
            this.walkToStoreRoom();
            break;
        case FacilityManagerStates.WALK_TO_STOREROOM:
            this.waitInStoreRoom();
            break;
        case FacilityManagerStates.WALK_TO_CORPSE:
            this.walkToCorpse();
            break;
        case FacilityManagerStates.CARRY_CORPSE_TO_PILE:
            this.carryCorpse();
            break;
        case FacilityManagerStates.BURN_PILE:
            this.burnPile();
            break;
    }
};

FacilityManager.prototype.paintExecution = function(ctx, velocity, frameIndexes) {

    // determine sequential frame index using game time
    const frameCount = frameIndexes.length;
    const frameIndex = Math.floor(gameStage.time / (200 / velocity)) % frameCount;
    drawFrame(ctx, FacilityManager.image, frameIndexes[frameIndex], this.x, this.y, 0, this.directionFactor * 1 / 24, 1 / 24, 0.5, 0.98);
};

FacilityManager.prototype.getCharacterFrames = function(isMoving) {

    return isMoving ? [0, 1, 2, 3, 2, 1] : [1, 4, 5, 5, 5, 4, 1, 1];
};

FacilityManager.prototype.walkToStoreRoom = function() {

    const moveTarget = this.gameState.level.facilityManagerWaitPoint;
    this.moveTo(moveTarget.x, moveTarget.y);
    this.state = FacilityManagerStates.WAIT_IN_STOREROOM;
};

FacilityManager.prototype.waitInStoreRoom = function() {

};

FacilityManager.prototype.walkToCorpse = function() {

};

FacilityManager.prototype.carryCorpse = function() {

};

FacilityManager.prototype.burnPile = function() {

};
