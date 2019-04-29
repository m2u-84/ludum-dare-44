
const CarStates = {
  SPAWNED: 0,
  DRIVE_TO_BREAKING_POINT: 1,
  BRAKE: 2,
  DRIVE_TO_HOSPITAL: 3,
  WAIT_BEFORE_HOSPITAL: 4,
  DRIVE_TO_VANISHINGPOINT: 5
};

function Car(x, y, gameState, driveFinishedCallback) {

    MovingObject.call(this, x, y, gameState);
    this.state = CarStates.SPAWNED;
    this.movingVelocity = 10;
    this.stopAtWayToPile = false;
    this.driveFinishedCallback = driveFinishedCallback;
}
inherit(Car, MovingObject);

Car.load = function() {

    const ASSETS_BASE_PATH = './assets/';
    const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    Car.image = loader.loadImage(IMAGES_BASE_PATH + 'police_car.png', 4, 2);
    Car.soundBrakes = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/police-braking/police-braking.mp3'});
    Car.soundSiren = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/police-siren/police-siren.mp3'});
    Car.soundSiren.loop = true;
    Car.soundDriving = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/car-driving/car-driving.mp3'});
    Car.soundDriving.volume = 0.5;
    Car.soundDriving.loop = true;
};

Car.prototype.update = function() {

    MovingObject.prototype.update.call(this);
    if (this.gameState.facilityManager) {
        if ((this.gameState.facilityManager.state === FacilityManagerStates.CARRY_CORPSE_TO_PILE) ||
            (this.gameState.facilityManager.state === FacilityManagerStates.BURN_PILE)) {
            this.stopAtWayToPile = true;
        }
    }
};

Car.prototype.setState = function(state) {

    this.state = state;
    this.stateChangedTime = gameStage.time;
};

Car.prototype.nextState = function() {

    switch (this.state) {
        case CarStates.SPAWNED:
            this.setState(CarStates.DRIVE_TO_BREAKING_POINT);
            this.driveToBreakingPoint();
            break;
        case CarStates.DRIVE_TO_BREAKING_POINT:
            this.setState(CarStates.BRAKE);
            this.brake(this.stopAtWayToPile);
            break;
        case CarStates.BRAKE:
            this.setState(CarStates.DRIVE_TO_HOSPITAL);
            this.driveToHospital();
            break;
        case CarStates.DRIVE_TO_HOSPITAL:
            this.setState(CarStates.WAIT_BEFORE_HOSPITAL);
            this.waitBeforeHospital(this.stopAtWayToPile);
            break;
        case CarStates.WAIT_BEFORE_HOSPITAL:
            this.setState(CarStates.DRIVE_TO_VANISHINGPOINT);
            this.driveToVanishingPoint();
            break;
        case CarStates.DRIVE_TO_VANISHINGPOINT:
            this.setState(CarStates.SPAWNED);
            this.jumpToSpawnPoint();
            this.gameState.cars.remove(this);
            this.driveFinishedCallback();
            break;
    }
};

Car.prototype.paint = function(ctx) {

    MovingObject.prototype.paint.call(this, ctx);
};

Car.prototype.paintExecution = function(ctx, velocity, frameIndexes) {

    // TODO: angle and isMoving for braking
    const frameIndex = Math.floor(gameStage.time / 100) % frameIndexes.length;
    const yCorrection = this.directionFactor.y < 0 ? -1 : 0;
    const angle = this.state === CarStates.DRIVE_TO_HOSPITAL ? Math.PI/20 : 0; // driving to hospital while breaking
    drawFrame(ctx, Car.image, frameIndexes[frameIndex], this.x, this.y, angle,
        this.directionFactor.x * 1 / 24, this.directionFactor.y * 1 / 24, 0.5,  0.6 + yCorrection);
};

Car.prototype.getCharacterFrames = function(isMoving) {

    if (this.state === CarStates.WAIT_BEFORE_HOSPITAL) {
        return [0];
    } else if (this.lastMoveDelta.x !== 0) {
        return [0, 1, 2, 3];
    } else {
        return [4, 5, 6, 7];
    }
};

Car.prototype.driveToBreakingPoint = function() {

    Car.soundDriving.play();
    const moveTarget = this.gameState.level.breakingPointCar;
    this.moveTo(moveTarget.x, moveTarget.y, () => this.nextState(), false);
};

Car.prototype.brake = function(playSound) {

    if (playSound) {
        Car.soundDriving.stop();
        Car.soundBrakes.play();
    }
    this.nextState();
};

Car.prototype.driveToHospital = function() {

    const moveTarget = this.gameState.level.parkingPointCar;
    this.moveTo(moveTarget.x, moveTarget.y, () => this.nextState(), false);
};

Car.prototype.waitBeforeHospital = function(playSound) {

    if (playSound) {
        Car.soundSiren.play();
        this.startWaitingTime(3000, () => {
            Car.soundSiren.stop();
            if (this.gameState.registerPoliceBribery()) {
                gameStage.cashflowFeed.addText("Lost $1000 due to police bribery");
                this.gameState.hospital.loseRevenue(1000, this.x, this.y);
            }
            this.nextState();
        }, false);
    } else {
        this.nextState();
    }
};

Car.prototype.driveToVanishingPoint = function() {

    Car.soundDriving.play();
    const moveTarget = this.gameState.level.vanishingPointCar;
    this.moveTo(moveTarget.x, moveTarget.y, () => {
        Car.soundDriving.stop();
        this.nextState();
    }, false);
};

Car.prototype.jumpToSpawnPoint = function() {

    const moveTarget = this.gameState.level.spawnPointCar;
    this.updateCharacterPosition(moveTarget.x, moveTarget.y);
};

