
function GameOverStage() {
  Stage.call(this, "gameover", 8);
}
inherit(GameOverStage, Stage);

GameOverStage.prototype.preload = function() {
  const ASSETS_BASE_PATH = './assets/';
  const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
  const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

  let endings = [
    'modal_gameover_1', // 0: Mafia Ending
    'modal_gameover_2', // 1: Police Ending
    'modal_gameover_3', // 2: Money Ending
  ];

  this.backgrounds = endings.map(ending => loader.loadImage(IMAGES_BASE_PATH + ending + '.png'));
  this.soundGameOver = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/outcomes/outcomes-gameover.mp3'});
}

GameOverStage.prototype.prestart = function(payload) {
  this.gameOverNr = payload;
  this.soundGameOver.play();
}

GameOverStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);

  // Black background
  ctx.globalAlpha = 0.5 * p;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);

  // Image
  ctx.globalAlpha = 1;
  const y = (h - this.backgrounds[this.gameOverNr].height) / 2 - ( (10 / p) - 10);
  const x = (w - this.backgrounds[this.gameOverNr].width) / 2;
  ctx.translate(x, y);
  drawImageToScreen(ctx, this.backgrounds[this.gameOverNr], 0, 0, 0, 1, 1, 0, 0);

  // Draw Statistics
  mainFont.drawText(ctx, gameStage.gameState.stats.patientCount, 135, 79, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsAccepted, 135, 90, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsRejected, 135, 101, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsDied, 135, 112, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsCured, 135, 123, "darkgray", 1);

  mainFont.drawText(ctx, gameStage.gameState.stats.treatments, 310, 79, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.treatmentsFailed, 310, 90, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.treatmentsSucceeded, 310, 101, "darkgray", 1);

  mainFont.drawText(ctx, gameStage.gameState.stats.diagnoses, 310, 121, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.moneyEarned, 310, 132, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.pingPongBounces, 310, 143, "darkgray", 1);

};

GameOverStage.prototype.onkey = function(event) {
  if (this.active && event.key == " ") {
    this.transitionTo("start");
  }
  if (this.active && event.key == "1" && this.gameOverNr == 2) {
    this.transitionOut(800);
  }
}
