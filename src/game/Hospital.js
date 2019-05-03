function Hospital() {
    this.balance = 2500;
    this.inventory = [];
    this.lastTime = 0;
    this.revenueDelay = 25000;
    this.organs = 1;
}

Hospital.load = function() {
    const ASSETS_BASE_PATH = './assets/';
    const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    Hospital.moneyImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_money.png');
    Hospital.organImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_organs.png');
    Hospital.timeImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_time.png');

    Hospital.soundGainMoney = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/money-handling/money-gain.mp3'});
    Hospital.soundLoseMoney = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/money-handling/money-loss.mp3'});
}

Hospital.prototype.update = function(td, time) {
    if (time < this.lastTime || time > this.lastTime + this.revenueDelay) {
        this.lastTime = time;
        this.collectRevenue();
    }
    if (this.balance >= 10000) {
        setTimeout(() => gameStage.gameState.setGameOver("gameover", 800, 2), 1000);
    }
};

Hospital.prototype.collectRevenue = function() {
    // Update each bed on its own
    let sum = 0;
    gameStage.gameState.level.beds.forEach(bed => {
        const rev = bed.getRevenue();
        if (rev) {
            sum += rev;
            this.giveRevenue(rev, bed.occupiedBy.x, bed.occupiedBy.y - 1.0);
        }
    });
    if (sum > 0) {
        gameStage.cashflowFeed.addText("earned $" + sum + " in bed rent", "money");
    }
};

Hospital.prototype.giveRevenue = function(rev, x, y) {
    if (rev < 0) {
        this.loseRevenue(-rev);
    }
    gameStage.gameState.stats.moneyEarned += rev;
    this.balance += rev;
    gameStage.showFloatingText("+$" + rev, x, y, "money");

    Hospital.soundGainMoney.play();
};

Hospital.prototype.loseRevenue = function(rev, x, y) {
    if (rev < 0) {
        this.giveRevenue(-rev);
    }
    this.balance -= rev;
    gameStage.showFloatingText("-$" + rev, x, y, "red");

    Hospital.soundLoseMoney.play();
};

Hospital.prototype.takeOrgan = function() {
    if (this.organs > 0) {
        this.organs--;
    } else {
        throw new Error("Tried to remove an organ from hospital inventory, although there are none");
    }
}

Hospital.prototype.giveOrgan = function() {
    this.organs++;
}

Hospital.prototype.draw = function(ctx) {
    const offy = 19;
    // Time
    let seconds = Math.floor((gameStage.time - gameStage.gameState.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    const time = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    drawImageToScreen(ctx, Hospital.timeImage, 3, 3, 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, time, 55, 9, "darkgray", 1);
    // Balance
    drawImageToScreen(ctx, Hospital.moneyImage, 3, 3 + offy, 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, "" + Math.floor(this.balance), 55, 9 + offy, "gold", 1);
    // Organs
    drawImageToScreen(ctx, Hospital.organImage, 3, 3 + 2 * offy, 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, "" + this.organs, 55, 9 + 2 * offy, "organ", 1);
}
