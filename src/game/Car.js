
const CarStates = {
  SPAWNED: 0,
  DRIVE_TO_BREAKING_POINT: 1,
  BRAKE: 2,
  DRIVE_TO_SPOT: 3,
  WAIT_BEFORE_HOSPITAL: 4, // TODO: rename properly
  DRIVE_TO_VANISHINGPOINT: 5
};

function Car(x, y, gameState, driveFinishedCallback) {

    MovingObject.call(this, x, y, gameState);
    this.state = CarStates.SPAWNED;
    this.movingVelocity = 10;
    this.driveFinishedCallback = driveFinishedCallback;
}
inherit(Car, MovingObject);

Car.load = function() {

    const ASSETS_BASE_PATH = './assets/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    Car.soundBrakes = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/police-braking/police-braking.mp3'});
    Car.soundDriving = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/car-driving/car-driving.mp3'});
    Car.soundDriving.volume = 0.3;
    Car.soundDriving.loop = true;
};

Car.prototype.update = function() {

    MovingObject.prototype.update.call(this);
};

Car.prototype.setState = function(state) {

    this.state = state;
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
            this.setState(CarStates.DRIVE_TO_SPOT);
            this.driveToSpot();
            break;
        case CarStates.DRIVE_TO_SPOT:
            this.setState(CarStates.WAIT_BEFORE_HOSPITAL);
            this.waitAtSpot(this.stopAtWayToPile);
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

Car.prototype.paintExecution = function(ctx) {

    const yCorrection = this.directionFactor.y < 0 ? -1 : 0;
    const angle = this.state === CarStates.DRIVE_TO_SPOT ? Math.PI/20 : 0; // driving to hospital while breaking
    let animationId = this.getAnimationId(this.isMoving);
    gameStage.animationPlayer.paint(ctx, animationId, this.x, this.y,
        0.5, 0.6 + yCorrection, this.directionFactor.x < 0, this.directionFactor.y < 0, angle);
};

Car.prototype.getAnimationPrefix = function() {

};

Car.prototype.getAnimationId = function(isMoving) {

    let base = this.getAnimationPrefix() + "-";
    if (this.state === CarStates.WAIT_BEFORE_HOSPITAL) {
        return base + "waiting";
    } else if (this.lastMoveDelta.x !== 0) {
        return base + "moving";
    } else {
        return base + "idle";
    }
};

Car.prototype.driveToBreakingPoint = function() {

    Car.soundDriving.play();
    const moveTarget = this.getBreakingPoint();
    this.moveTo(moveTarget.x, moveTarget.y, () => this.nextState(), false);
};

Car.prototype.getBreakingPoint = function() {

};

Car.prototype.brake = function(playSound) {

    if (playSound) {
        Car.soundDriving.stop();
        Car.soundBrakes.play();
    }
    this.nextState();
};

Car.prototype.driveToSpot = function() {

    const moveTarget = this.getParkingPoint();
    this.moveTo(moveTarget.x, moveTarget.y, () => this.nextState(), false);
};

Car.prototype.getParkingPoint = function() {

};

Car.prototype.waitAtSpot = function(playSound) {

    if (playSound) {
        this.playWaitingSound();
        this.startWaitingTime(3000, () => {
            this.stopWaitingSound();
            this.performWaitingAction();
            this.nextState();
        }, false);
    } else {
        this.nextState();
    }
};

Car.prototype.playWaitingSound = function() {

};

Car.prototype.stopWaitingSound = function() {

};

Car.prototype.performWaitingAction = function() {

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
