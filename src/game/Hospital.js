function Hospital() {
    this.balance = 1000;
    this.inventory = [];
    this.lastTime = 0;
    this.revenueDelay = 10000;
    this.organs = 1;
}

Hospital.prototype.update = function(td, time) {
    if (time < this.lastTime || time > this.lastTime + this.revenueDelay) {
        this.lastTime = time;
        this.collectRevenue();
    }
};

Hospital.prototype.collectRevenue = function() {
    // Update each bed on its own
    gameStage.gameState.level.beds.forEach(bed => {
        const rev = bed.getRevenue();
        if (rev) {
            this.giveRevenue(rev, bed.occupiedBy.x, bed.occupiedBy.y - 1.0);
        }
    });
};

Hospital.prototype.giveRevenue = function(rev, x, y) {
    this.balance += rev;
    gameStage.showFloatingText("+$" + rev, x, y, "#f0c030");
};

Hospital.prototype.loseRevenue = function(rev, x, y) {
    this.balance -= rev;
    gameStage.showFloatingText("-$" + rev, x, y, "#f0c030");
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
    mainFont.drawText(ctx, "$" + Math.floor(this.balance), 3, 3, "money", 0);
    // Organs
    mainFont.drawText(ctx, "Organs: " + this.organs, 3, 15, "organ", 0);
}
