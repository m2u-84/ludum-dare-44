
function MinigameStage(name) {
  Stage.call(this, name, 5);
  this.helpText = "Press Space to interact";
  // Drawable canvas size, updated in render function
  this.w = 0;
  this.h = 0;
  this.margin = 32;
  this.treatment = undefined; // set this in constructor of extending class!
  this.success = false;
  this.numberOfExecutions = 0;
  this.firstAttempt = true; // first attempt -> multiple tries
  this.trainingLeft = false;
  this.succeededOnce = false;
  this.forceHelpText = false;
  this.helpText = "";
  this.paused = false;
  this.closeTime = 0;
}
inherit(MinigameStage, Stage);

MinigameStage.prototype.preload = function() {
  this.background = loader.loadAssetImage('minigames_background.png');
  this.labelPerfect = loader.loadAssetImage('perfect.png', 1, 22);
  this.labelWhoops = loader.loadAssetImage('whoops.png', 1, 22);
  this.soundSuccess = loader.loadAssetAudio({src: 'sounds/outcomes/outcomes-success.mp3'});
  this.soundFailure = loader.loadAssetAudio({src: 'sounds/outcomes/outcomes-failure.mp3'});
};

MinigameStage.prototype.prestart = function(payload) {
  this.success = false;
  this.paused = false;
  this.payload = payload;
  this.patient = payload.patient;
  this.firstAttempt = (this.numberOfExecutions == 0 || !this.trainingLeft);
  this.numberOfExecutions++;
  this.closeTime = 0;
  this.closeCallback = null;
  this.hintProgress = 0;
  this.labelFrame = 0;
};

MinigameStage.prototype.stop = function() {
  this.patient.gameState.stats.treatments++;
  if (this.success) {
    const regenerationEffect = this.treatment.getRandomizedEffect(this.patient.sickness);
    const absoluteEffect = this.treatment.getRandomizedEffect(this.patient.sickness);
    this.patient.addEffect(regenerationEffect, absoluteEffect, this.treatment);
    this.patient.gameState.stats.treatmentsSucceeded++;
  } else {
    const {regenerative, absolute} = this.treatment.getFailureEffects();
    this.patient.addEffect(regenerative, absolute, this.treatment);
    this.patient.gameState.stats.treatmentsFailed++;
  }
  // Award money
  const money = this.patient.getTreatmentPrice(this.treatment);
  if (money) {
    gameStage.gameState.hospital.giveRevenue(money, this.patient.x, this.patient.y - 2);
  }
};

MinigameStage.prototype.close = function(success) {
  this.success = success;

  if (this.success) {
    this.soundSuccess.play();
  } else {
    this.soundFailure.play();
  }

  if (this.firstAttempt) {
    // Restart during training mode
    if (success) {
      this.succeededOnce = true;
    }
    this.paused = true;
    this.pauseTime = this.time;
    this.closeTime = this.time + 1000;
    this.closeCallback = () => this.prestart(this.payload);
  } else {
    // No training mode, so close minigame
    this.paused = true;
    this.pauseTime = this.time;
    this.closeTime = this.time + 1000;
    this.closeCallback = null;
    this.hint = gameStage.gameState.hintSystem.getHint();
  }
}

MinigameStage.prototype.update = function(timer) {
  if (this.getKeyState("Enter") && !this.trainingLeft) { // && this.succeededOnce) {
    this.trainingLeft = true;
    this.prestart(this.payload);
  } else if (this.getKeyState("Escape") && this.active && !stageManager.get("pause").alive) {
    this.transitionIn("pause", 400);
  } else if (this.closeTime) {
    if (this.time >= this.closeTime) {
      if (this.closeCallback) { this.closeCallback(); }
      this.hintProgress = clamp(this.hintProgress + this.timeDif * 0.003, 0, 1);
      if (this.getKeyState(" ") || this.getKeyState("Enter")) {
        if (!this.closeCallback) { this.transitionOut(700); }
      }
    }
  }
};

MinigameStage.prototype.render = function(ctx, timer) {
  // Default transition for all minigames
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }
  // Background
  this.w = w - 2 * this.margin;
  this.h = h - 2 * this.margin;
  const x = Math.round(this.margin * 1.9);
  ctx.drawImage(this.background, x, this.margin, this.w, this.h);
  ctx.translate(x, this.margin);
  // Clipping
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.w, 0);
  ctx.lineTo(this.w, this.h);
  ctx.lineTo(0, this.h);
  ctx.closePath();
  ctx.clip();
};

/**
 * Debugging helper method that allows easily identifying points in space by rendering them as circles.
 * Useful for success criteria depending on dynamic and otherwise not explicitly rendered positions.
 */
MinigameStage.prototype.renderPosition = function(ctx, x, y) {
  ctx.save();
  ctx.beginPath();
  const rad = 5;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "green";
  ctx.beginPath();
  ctx.moveTo(x, y - rad);
  ctx.arc(x, y, rad, 0, 6.28);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

MinigameStage.prototype.renderOnTop = function(ctx, timer) {
  // Help Text
  if (this.firstAttempt) {
    const helpY = 32;
    ctx.globalAlpha = Interpolators.cubic3(Math.sqrt(0.5 + 0.5 * Math.sin(this.time * 0.0032)));
    const text = this.succeededOnce ? "press enter when you've trained enough" : "Training mode";
    mainFont.drawText(ctx, text, this.w / 2, helpY, "white", 0.5, BitmapFontStyle.OUTLINE);
    if (this.helpText && (!this.succeededOnce || this.forceHelpText)) {
      mainFont.drawText(ctx, this.helpText, this.w / 2, helpY + 20, "white", 0.5, BitmapFontStyle.OUTLINE);
    }
    ctx.globalAlpha = 1;
  }
  // Success or not
  if (this.paused) {
    if (this.time - this.pauseTime >= (Math.floor((this.closeTime - this.pauseTime) / this.labelPerfect.frameCount) * (this.labelFrame + 1))) {
      this.labelFrame++;
    }
    if (this.labelFrame < this.labelPerfect.frameCount) {
      if (this.success) {
        // Perfect
          drawFrame(ctx, this.labelPerfect, this.labelFrame, this.w / 2, this.h / 2, 0, 1, 1, 0.5, 0.5, 1)
      } else {
        // Whoops
        drawFrame(ctx, this.labelWhoops, this.labelFrame, this.w / 2, this.h / 2, 0, 1, 1, 0.5, 0.5, 1)
      }
    }
  }
  // Hint
  if (this.hintProgress > 0) {
    // Black background
    ctx.globalAlpha = Interpolators.cubic2(this.hintProgress);
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, this.w, this.h);
    // Hint
    if (this.hint) {
      const lines = this.hint.getLines();
      let y = Math.round(this.h * 0.5 - 10 * (lines.length - 1));
      for (const line of lines) {
        mainFont.drawText(ctx, line, this.w / 2, y, "white", 0.5, BitmapFontStyle.NONE);
        y += 20;
      }
      ctx.globalAlpha *= 0.5;
      mainFont.drawText(ctx, "Did you know?", this.w / 2, 25, "white", 0.5, BitmapFontStyle.NONE);
      mainFont.drawText(ctx, "Space to proceed", this.w / 2, this.h - 25, "white", 0.5, BitmapFontStyle.NONE);
    }
  }
};
