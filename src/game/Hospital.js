function Hospital(gameState) {
    this.currentLevel = gameState.currentLevel;
    this.balance = this.currentLevel.params.hospital.startingBalance;
    this.inventory = [];
    this.lastTime = 0;
    this.revenueDelay = this.currentLevel.params.hospital.revenueDelay;
    this.organs = this.currentLevel.params.hospital.startingOrgans;
    this.lastOrganSpent = 0;

    // Get Game Over Conditions for Hospital
    this.balanceAboveCheck = this.currentLevel.gameOver.find(item => item.type == 'balanceAbove');
}

Hospital.load = function() {
    const ASSETS_BASE_PATH = './assets/';
    const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

    Hospital.moneyImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_money.png');
    Hospital.organImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_organs.png');
    Hospital.timeImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_time.png');
    Hospital.policeImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_police.png');
    Hospital.policeStrikeImage = loader.loadImage(IMAGES_BASE_PATH + 'hud_strike.png');

    Hospital.soundGainMoney = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/money-handling/money-gain.mp3'});
    Hospital.soundLoseMoney = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/money-handling/money-loss.mp3'});
}

Hospital.prototype.update = function(td, time) {
    if (time < this.lastTime || time > this.lastTime + this.revenueDelay) {
        this.lastTime = time;
        this.collectRevenue();
    }

    if (this.balanceAboveCheck && this.balance >= this.balanceAboveCheck.value) {
        setTimeout(() => gameStage.gameState.setGameOver("gameover", 800, this.balanceAboveCheck.stageNum), 1000);
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
        this.loseRevenue(-rev, x, y);
        return;
    }
    gameStage.gameState.stats.moneyEarned += rev;
    this.balance += rev;
    gameStage.showFloatingText("+$" + rev, x, y, "money");

    Hospital.soundGainMoney.play();
};

Hospital.prototype.loseRevenue = function(rev, x, y) {
    if (rev < 0) {
        this.giveRevenue(-rev, x, y);
        return;
    }
    this.balance -= rev;
    gameStage.showFloatingText("-$" + rev, x, y, "red");

    Hospital.soundLoseMoney.play();
};

Hospital.prototype.takeOrgan = function() {
    if (this.organs > 0) {
        this.lastOrganSpent = gameStage.time;
        this.organs--;
        if (this.organs <= 0) {
            gameStage.cashflowFeed.addText("You gave away your last organ", "red");
        }
    } else {
        throw new Error("Tried to remove an organ from hospital inventory, although there are none");
    }
}

Hospital.prototype.giveOrgan = function() {
    this.organs++;
}

Hospital.prototype.draw = function(ctx) {
    const offy = 19;
    let y = 3;
    // Time
    let seconds = Math.floor((gameStage.time - gameStage.gameState.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    const time = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    drawImageToScreen(ctx, Hospital.timeImage, 3, y, 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, time, 55, y + 6, "darkgray", 1);
    // Balance
    y += offy;
    drawImageToScreen(ctx, Hospital.moneyImage, 3, y, 0, 1, 1, 0, 0);
    if (this.balance <= gameStage.gameState.danegeld) { this.flashWarning(ctx, 3, y); }
    mainFont.drawText(ctx, "" + Math.floor(this.balance), 55, y + 6, "gold", 1);
    // Organs
    y += offy;
    drawImageToScreen(ctx, Hospital.organImage, 3, y, 0, 1, 1, 0, 0);
    if (this.organs <= 0 && gameStage.time - this.lastOrganSpent < 5000) { this.flashWarning(ctx, 3, y); }
    mainFont.drawText(ctx, "" + this.organs, 55, y + 6, "organ", 1);
    
    // Police
    if (this.currentLevel.params.police.enabled) {
      y += offy;
      drawImageToScreen(ctx, Hospital.policeImage, 3, y, 0, 1, 1, 0, 0);
      if (gameStage.gameState.policyBriberyAttempts >= 2 ||
          gameStage.time - gameStage.gameState.lastBriberyAttempt < 12000) { this.flashWarning(ctx, 3, y); }
      for (let i = 0; i < 3; i++) {
        const alpha = (i < gameStage.gameState.policyBriberyAttempts) ? 1 : 0.2;
        drawImageToScreen(ctx, Hospital.policeStrikeImage, 23 + 11 * i, y + 4, 0, 1, 1, 0, 0, alpha);
      }
    }
};

Hospital.prototype.flashWarning = function(ctx, x, y) {
    if (gameStage.time % 560 < 300) {
        ctx.save();
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        ctx.fillRect(x + 1, y + 1, 53, 16);
        ctx.restore();
    }
};
