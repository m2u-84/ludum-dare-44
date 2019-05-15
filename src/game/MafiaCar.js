function MafiaCar(x, y, gameState, driveFinishedCallback) {

    Car.call(this, x, y, gameState, driveFinishedCallback);
    this.state = CarStates.SPAWNED;
    this.movingVelocity = 10;
    this.stopAtWayToPile = true;
}
inherit(MafiaCar, Car);

MafiaCar.load = function() {
    MafiaCar.image = loader.loadAssetImage('mafia_car.png', 4, 2);
    MafiaCar.soundMafia = loader.loadAssetAudio({src: 'sounds/mafia-robbing/mafia-robbing.mp3'});
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
    this.gameState.danegeld += this.gameState.currentLevel.params.mafia.additionalDanegeld;
    gameStage.cashflowFeed.addText("The Mafia kindly asked for $" + danegeld + " danegeld");
    this.gameState.hospital.loseRevenue(danegeld, this.x, this.y);

    if (this.gameState.hospital.balance < 0) {
        this.gameState.setGameOver("gameover", 800, "mafia");
    }
};
