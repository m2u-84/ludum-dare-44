
function MinigameStage(name) {
  Stage.call(this, name, 5);
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
  this.helpText = "";
  this.paused = false;
}
inherit(MinigameStage, Stage);

MinigameStage.prototype.preload = function() {
  const ASSETS_BASE_PATH = './assets/';
  const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
  const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

  this.background = loader.loadImage(IMAGES_BASE_PATH + 'minigames_background.png');
  this.successIcon = loader.loadImage(IMAGES_BASE_PATH + 'tick.png');
  this.failIcon = loader.loadImage(IMAGES_BASE_PATH + 'cross.png');

  this.soundSuccess = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/outcomes/outcomes-success.mp3'});
  this.soundFailure = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/outcomes/outcomes-failure.mp3'});
};

MinigameStage.prototype.prestart = function(payload) {
  this.success = false;
  this.paused = false;
  this.payload = payload;
  this.patient = payload.patient;
  this.firstAttempt = (this.numberOfExecutions == 0 || !this.trainingLeft);
  this.numberOfExecutions++;
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
  gameStage.gameState.hospital.giveRevenue(money, this.patient.x, this.patient.y - 2);
};

MinigameStage.prototype.close = function(success) {
  this.success = success;

  if (this.success) {
    this.soundSuccess.play();
  } else {
    this.soundFailure.play();
  }

  if (this.firstAttempt) {
    if (success) {
      this.succeededOnce = true;
    }
    this.paused = true;
    setTimeout(() => this.prestart(this.payload), 700);
  } else {
    this.paused = true;
    setTimeout(() => this.transitionOut(), 700);
  }
}

MinigameStage.prototype.update = function(timer) {
  if (this.getKeyState("Enter") && !this.trainingLeft) { // && this.succeededOnce) {
    this.trainingLeft = true;
    this.prestart(this.payload);
  } else if (this.getKeyState("Escape") && this.active && !stageManager.get("pause").alive) {
    this.transitionIn("pause", 400);
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

MinigameStage.prototype.renderOnTop = function(ctx, timer) {
  // Help Text
  if (this.firstAttempt) {
    const helpY = 32;
    ctx.globalAlpha = 0.7 + 0.25 * Math.sin(this.time * 0.0032);
    const text = "Training mode" + (this.succeededOnce || true ? " - press enter to begin treatment" : "");
    mainFont.drawText(ctx, text, this.w / 2, helpY, "white", 0.5);
    if (this.helpText) {
      mainFont.drawText(ctx, this.helpText, this.w / 2, helpY + 20, "white", 0.5);
    }
    ctx.globalAlpha = 1;
  }
  // Success or not
  if (this.paused) {
    if (this.success) {
      // Checkmark
      drawImageToScreen(ctx, this.successIcon, this.w / 2, this.h / 2, 0, 1, 1, 0.5, 0.5);
    } else {
      // Nope
      drawImageToScreen(ctx, this.failIcon, this.w / 2, this.h / 2, 0, 1, 1, 0.5, 0.5);
    }
  }
};
