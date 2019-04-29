function Hospital() {
    this.balance = 9000;
    this.inventory = [];
    this.lastTime = 0;
    this.revenueDelay = 10000;
    this.organs = 1;
}

Hospital.load = function() {
    Hospital.moneyImage = loader.loadImage("assets/images/hud_money.png");
    Hospital.organImage = loader.loadImage("assets/images/hud_organs.png");
    Hospital.timeImage = loader.loadImage("assets/images/hud_time.png");
}

Hospital.prototype.update = function(td, time) {
    if (time < this.lastTime || time > this.lastTime + this.revenueDelay) {
        this.lastTime = time;
        this.collectRevenue();
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
        gameStage.cashflowFeed.addText("earned $" + sum + " in bed rent", "gold");
    }
};

Hospital.prototype.giveRevenue = function(rev, x, y) {
    if (rev < 0) {
        this.loseRevenue(-rev);
    }
    this.balance += rev;
    gameStage.showFloatingText("+$" + rev, x, y, "money");
};

Hospital.prototype.loseRevenue = function(rev, x, y) {
    if (rev < 0) {
        this.giveRevenue(-rev);
    }
    this.balance -= rev;
    gameStage.showFloatingText("-$" + rev, x, y, "red");
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
    let seconds = Math.floor(gameStage.time / 1000);
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
