function MafiaCar(x, y, gameState, driveFinishedCallback) {

    Car.call(this, x, y, gameState, driveFinishedCallback);
    this.state = CarStates.SPAWNED;
}
inherit(MafiaCar, Car);

MafiaCar.load = function() {

    const ASSETS_BASE_PATH = './assets/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    MafiaCar.soundMafia = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/mafia-robbing/mafia-robbing.mp3'});
    // MafiaCar.soundMafia.loop = true;
};

MafiaCar.prototype.getAnimationPrefix = function() {

    return "mafia-car";
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
    this.gameState.hospital.loseRevenue(danegeld, this.x, this.y);

    if (this.gameState.hospital.balance < 0) {
        this.gameState.setGameOver("gameover", 800, 0);
    }
};
