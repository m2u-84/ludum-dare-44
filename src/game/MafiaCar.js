function MafiaCar(x, y, gameState, driveFinishedCallback) {

    Car.call(this, x, y, gameState, driveFinishedCallback);
    this.state = CarStates.SPAWNED;
    this.movingVelocity = 10;
    this.stopAtWayToPile = true;
}
inherit(MafiaCar, Car);

MafiaCar.load = function() {

    const ASSETS_BASE_PATH = './assets/';
    const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    MafiaCar.image = loader.loadImage(IMAGES_BASE_PATH + 'mafia_car.png', 4, 2);
    MafiaCar.soundMafia = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/mafia-robbing/mafia-robbing.mp3'});
    MafiaCar.soundMafia.loop = true;
};

MafiaCar.prototype.getCarImage = function() {

    return MafiaCar.image;
};

MafiaCar.prototype.getBreakingPoint = function() {

    return this.gameState.level.breakingPointMafiaCar;
};

MafiaCar.prototype.getParkingPoint = function() {

    return this.gameState.level.parkingPointMafiaCar;
};

MafiaCar.prototype.playWaitingSound = function() {

    MafiaCar.soundMafia.play();
};

MafiaCar.prototype.stopWaitingSound = function() {

    MafiaCar.soundMafia.stop();
};

MafiaCar.prototype.performWaitingAction = function() {

    const danegeld = this.gameState.danegeld;
    this.gameState.danegeld += 400;
    gameStage.cashflowFeed.addText("The Mafia kindly asked for $" + danegeld + " danegeld");

    if (this.gameState.hospital.balance - danegeld < 0) {
        gameStage.transitionIn("gameover", 800, 0);
    } else {
        this.gameState.hospital.loseRevenue(danegeld, this.x, this.y);
    }
};
