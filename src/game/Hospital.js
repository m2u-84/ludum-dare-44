function Hospital(gameState) {
    this.currentLevel = gameState.currentLevel;
    this.balance = this.currentLevel.params.hospital.startingBalance;
    this.inventory = [];
    this.lastTime = 0;
    this.revenueDelay = this.currentLevel.params.hospital.revenueDelay;
    this.organs = this.currentLevel.params.hospital.startingOrgans;
    this.lastOrganSpent = 0;
}

Hospital.load = function() {
    Hospital.policeStrikeImage = loader.loadAssetImage('hud_strike.png');
    Hospital.hudFrames = loader.loadAssetImage('hud.png', 1, 7);

    Hospital.soundGainMoney = loader.loadAssetAudio({src: 'sounds/money-handling/money-gain.mp3'});
    Hospital.soundLoseMoney = loader.loadAssetAudio({src: 'sounds/money-handling/money-loss.mp3'});
}

Hospital.prototype.update = function(td, time) {
    if (time < this.lastTime || time > this.lastTime + this.revenueDelay) {
        this.lastTime = time;
        this.collectRevenue();
    }

    if (this.currentLevel.gameOver.balanceAbove && this.balance >= this.currentLevel.gameOver.balanceAbove.value) {
        setTimeout(() => gameStage.gameState.setGameOver("gameover", 800, this.currentLevel.gameOver.balanceAbove.endingKey), 1000);
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
    const offy = 20;
    let y = 3;

    // Time
    let seconds = Math.floor((gameStage.time - gameStage.gameState.startTime) / 1000);
    gameStage.gameState.stats.totalSeconds = seconds;
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    const time = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    gameStage.gameState.stats.playTime = time;
    drawFrame(ctx, Hospital.hudFrames, 0, 3, y, 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, time, 55, y + 6, "darkgray", 1);

    // Balance
    y += offy;
    drawFrame(ctx, Hospital.hudFrames, 1, 3, y, 0, 1, 1, 0, 0);
    if (this.balance <= gameStage.gameState.danegeld) { this.flashWarning(ctx, 3, y); }
    mainFont.drawText(ctx, "" + Math.floor(this.balance), 55, y + 6, "gold", 1);

    // Organs
    y += offy;
    drawFrame(ctx, Hospital.hudFrames, 2, 3, y, 0, 1, 1, 0, 0);
    if (this.organs <= 0 && gameStage.time - this.lastOrganSpent < 5000) { this.flashWarning(ctx, 3, y); }
    mainFont.drawText(ctx, "" + this.organs, 55, y + 6, "organ", 1);

    // Police
    if (this.currentLevel.params.police.enabled) {
      y += offy;
      drawFrame(ctx, Hospital.hudFrames, 4, 3, y, 0, 1, 1, 0, 0);
      if (gameStage.gameState.policyBriberyAttempts >= 2 ||
          gameStage.time - gameStage.gameState.lastBriberyAttempt < 12000) { this.flashWarning(ctx, 3, y); }
      for (let i = 0; i < 3; i++) {
        const alpha = (i < gameStage.gameState.policyBriberyAttempts) ? 1 : 0.2;
        drawImageToScreen(ctx, Hospital.policeStrikeImage, 23 + 11 * i, y + 4, 0, 1, 1, 0, 0, alpha);
      }
    }

    // Patients Healed
    if (this.currentLevel.gameOver.curedPatientsCountEquals) {
      y += offy;
      drawFrame(ctx, Hospital.hudFrames, 3, 3, y, 0, 1, 1, 0, 0);
      mainFont.drawText(ctx, "" + gameStage.gameState.stats.patientsCured, 34, y + 6, "gray", 1);
      mainFont.drawText(ctx, "" + this.currentLevel.gameOver.curedPatientsCountEquals.value, 55, y + 6, "green", 1);
    }
    // Patients rejected
    if (this.currentLevel.gameOver.patientsRejectedEquals) {
      y += offy;
      drawFrame(ctx, Hospital.hudFrames, 6, 3, y, 0, 1, 1, 0, 0);
      mainFont.drawText(ctx, "" + gameStage.gameState.stats.patientsRejected, 34, y + 6, "gray", 1);
      mainFont.drawText(ctx, "" + this.currentLevel.gameOver.patientsRejectedEquals.value, 55, y + 6, "red", 1);
    }
    // Patients Killed
    if (this.currentLevel.gameOver.deathCountEquals) {
      y += offy;
      drawFrame(ctx, Hospital.hudFrames, 5, 3, y, 0, 1, 1, 0, 0);
      mainFont.drawText(ctx, "" + gameStage.gameState.stats.patientsDied, 34, y + 6, "gray", 1);
      mainFont.drawText(ctx, "" + this.currentLevel.gameOver.deathCountEquals.value, 55, y + 6, "red", 1);
    }
};

Hospital.prototype.flashWarning = function(ctx, x, y) {
    if (gameStage.time % 560 < 300) {
        ctx.save();
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        ctx.fillRect(x + 1, y + 1, 53, 17);
        ctx.restore();
    }
};
