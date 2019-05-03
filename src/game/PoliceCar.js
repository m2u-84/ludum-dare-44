function PoliceCar(x, y, gameState, driveFinishedCallback) {

    Car.call(this, x, y, gameState, driveFinishedCallback);
    this.state = CarStates.SPAWNED;
    this.movingVelocity = 10;
}
inherit(PoliceCar, Car);

PoliceCar.load = function() {

    const ASSETS_BASE_PATH = './assets/';
    const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    PoliceCar.image = loader.loadImage(IMAGES_BASE_PATH + 'police_car.png', 4, 2);
    PoliceCar.soundSiren = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/police-siren/police-siren.mp3'});
    // PoliceCar.soundSiren.loop = true;
};

PoliceCar.prototype.update = function() {

    Car.prototype.update.call(this);
    if (this.gameState.facilityManager) {
        if ((this.gameState.facilityManager.state === FacilityManagerStates.CARRY_CORPSE_TO_PILE) ||
            (this.gameState.facilityManager.state === FacilityManagerStates.BURN_PILE)) {
            if (this.gameState.facilityManager.isOutside()) {
                this.stopAtWayToPile = true;
            }
        }
    }
};

PoliceCar.prototype.getCarImage = function() {

    return PoliceCar.image;
};

PoliceCar.prototype.getBreakingPoint = function() {

    return this.gameState.level.breakingPointPoliceCar;
};

PoliceCar.prototype.getParkingPoint = function() {

    return this.gameState.level.parkingPointPoliceCar;
};

PoliceCar.prototype.playWaitingSound = function() {

    PoliceCar.soundSiren.play();
};

PoliceCar.prototype.stopWaitingSound = function() {

    PoliceCar.soundSiren.stop();
};

PoliceCar.prototype.performWaitingAction = function() {

    if (this.gameState.registerPoliceBribery()) {
        gameStage.cashflowFeed.addText("Lost $1000 due to police bribery");
        this.gameState.hospital.loseRevenue(1000, this.x, this.y);
    }
};
