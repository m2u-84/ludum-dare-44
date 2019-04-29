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
    this.balance += rev;
    gameStage.showFloatingText("+$" + rev, x, y, "money");
};

Hospital.prototype.loseRevenue = function(rev, x, y) {
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

Hospital.prototype.draw = function(ctx) {
    // Balance
    drawImageToScreen(ctx, Hospital.moneyImage, 3, 3, 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, "" + Math.floor(this.balance), 55, 9, "gold", 1);
    // Organs
    drawImageToScreen(ctx, Hospital.organImage, 3, 22, 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, "" + this.organs, 55, 27, "organ", 1);
}
