
function GameOverStage() {
  Stage.call(this, "gameover", 8);
}
inherit(GameOverStage, Stage);

GameOverStage.prototype.preload = function() {
  const endings = [
    'gameover_1', // 0: Mafia Ending
    'gameover_2', // 1: Police Ending
    'gameover_3', // 2: Money Ending
  ];

  const backToMenuButtonFrames = {
    idle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
    idleSpeed: 75,
    hovered: [6],
    hoveredSpeed: 75,
    armed: [7],
    armedSpeed: 75
  }

  const keepPlayingButtonFrames = {
    idle: [9, 10, 11, 12, 13, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    idleSpeed: 75,
    hovered: [14],
    hoveredSpeed: 75,
    armed: [15],
    armedSpeed: 75
  }

  this.scorePanelFrames = [1, 2, 3, 4, 5, 6, 7];
  this.scorePanelFrame = 0;

  this.scoreLabelFrames = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  this.scoreLabelFrame = 0;

  this.buttonImage = loader.loadAssetImage('gameover_buttons.png', 8, 2);
  this.hoverSound = loader.loadAssetAudio({src: 'sounds/key-clicking/key-clicking.mp3'});
  this.confirmSound = loader.loadAssetAudio({src: 'sounds/key-clicking/confirm.mp3'});
  this.gameOverImages = endings.map(ending => loader.loadAssetImage(ending + '.png'));
  this.modalBackground = loader.loadAssetImage('modal_gameover.png');
  this.scorePanelImage = loader.loadAssetImage('scorepanel.png', 1, 8);
  this.scoreLabelImage = loader.loadAssetImage('scorelabel.png', 1, 14);
  this.soundGameOver = loader.loadAssetAudio({src: 'sounds/outcomes/outcomes-gameover.mp3'});
  this.backToMenuButton = new Button(this.buttonImage, backToMenuButtonFrames, function() { stageManager.activeStage.transitionTo("levelSelect"); }, this.confirmSound, this.hoverSound);
  this.keepPlayingButton = new Button(this.buttonImage, keepPlayingButtonFrames, function() { stageManager.activeStage.transitionOut(800); }, this.confirmSound, this.hoverSound);
}

GameOverStage.prototype.prestart = function(payload) {
  this.gameOverNr = payload;
  this.soundGameOver.play();

  // Set highscores
  this.score = gameStage.calculateScore(this.gameOverNr == 2 ? true : false);
  if (gameStage.isHighscore(gameStage.gameState.currentLevel.num, this.score)) {
    this.isHighscore = true;
    gameStage.writeHighScore(gameStage.gameState.currentLevel.num, this.score)
  }
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
  const y = (h - this.modalBackground.height) / 2 - ( (10 / p) - 10);
  const x = (w - this.modalBackground.width) / 2;

  ctx.translate(x, y);
  drawImageToScreen(ctx, this.modalBackground, 0, 0, 0, 1, 1, 0, 0);
  drawImageToScreen(ctx, this.gameOverImages[this.gameOverNr], 5, 9, 0, 1, 1, 0, 0);

  // Draw Score
  if (this.isHighscore) {
    this.scoreLabelFrame = getArrayFrame(timer.gameTime / 100, this.scoreLabelFrames);
    this.scorePanelFrame = getArrayFrame(timer.gameTime / 150, this.scorePanelFrames);
  }
  drawFrame(ctx, this.scoreLabelImage, this.scoreLabelFrame, 19, 161, 0, 1, 1, 0, 0);
  drawFrame(ctx, this.scorePanelImage, this.scorePanelFrame, 19, 174, 0, 1, 1, 0, 0);
  bigFont.drawText(ctx, "" + this.score, 152, 182, "green", 1);

  // Draw Statistics
  mainFont.drawText(ctx, gameStage.gameState.stats.playTime, 135, 79, "green", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientCount, 135, 90, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsAccepted, 135, 101, "green", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsRejected, 135, 112, "red", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsDied, 135, 123, "red", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.patientsCured, 135, 134, "green", 1);

  mainFont.drawText(ctx, gameStage.gameState.stats.treatments, 310, 79, "darkgray", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.treatmentsFailed, 310, 90, "red", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.treatmentsSucceeded, 310, 101, "green", 1);

  mainFont.drawText(ctx, gameStage.gameState.stats.diagnoses, 310, 121, "green", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.moneyEarned, 310, 132, "green", 1);
  mainFont.drawText(ctx, gameStage.gameState.stats.pingPongBounces, 310, 143, "green", 1);

  // Draw Buttons
  if (this.gameOverNr == 2) {
    this.keepPlayingButton.paint(ctx, 180, 190, x, y);
    this.backToMenuButton.paint(ctx, 180, 166, x, y);
  } else {
    this.backToMenuButton.paint(ctx, 180, 178, x, y);
  }

};

GameOverStage.prototype.onkey = function(event) {
  if (this.time > 1500) {
    if (this.active && event.key == " ") {
      this.transitionTo("start");
    }
    if (this.active && event.key == "1" && this.gameOverNr == 2) {
      this.transitionOut(800);
    }
  }
}
