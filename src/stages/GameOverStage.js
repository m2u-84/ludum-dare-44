
function GameOverStage() {
  Stage.call(this, "gameover", 8);
}
inherit(GameOverStage, Stage);

GameOverStage.prototype.preload = function() {

  this.endings = {
    mafia: {
      win: false,
      keepPlaying: false,
      image: loader.loadAssetImage('gameover_mafia.png')
    },
    police: {
      win: false,
      keepPlaying: false,
      image: loader.loadAssetImage('gameover_police.png')
    },
    beach: {
      win: true,
      keepPlaying: true,
      image: loader.loadAssetImage('gameover_beach.png')
    },
    goodDoctor: {
      win: true,
      keepPlaying: true,
      image: loader.loadAssetImage('gameover_goodDoctor.png')
    },
    badDoctor: {
      win: false,
      keepPlaying: false,
      image: loader.loadAssetImage('gameover_badDoctor.png')
    },
  }

  this.backToMenuButtonFrames = {
    idle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
    idleSpeed: 75,
    hovered: [6],
    hoveredSpeed: 75,
    armed: [7],
    armedSpeed: 75
  }

  this.keepPlayingButtonFrames = {
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
  this.modalBackground = loader.loadAssetImage('modal_gameover.png');
  this.scorePanelImage = loader.loadAssetImage('scorepanel.png', 1, 8);
  this.scoreLabelImage = loader.loadAssetImage('scorelabel.png', 1, 14);
  this.soundGameOver = loader.loadAssetAudio({src: 'sounds/outcomes/outcomes-gameover.mp3'});
}

GameOverStage.prototype.prestart = function(payload) {
  this.endingKey = payload;
  this.currentEnding = this.endings[this.endingKey];
  this.soundGameOver.play();

  // Set highscores
  this.score = gameStage.calculateScore(this.currentEnding.win);
  if (gameStage.isHighscore(gameStage.gameState.currentLevel.num, this.score)) {
    this.isHighscore = true;
    gameStage.writeHighScore(gameStage.gameState.currentLevel.num, this.score)
  }

  this.menu = new MenuHandler();

  this.backToMenuButton = new Button(this.buttonImage, this.menu, this.backToMenuButtonFrames, () => this.transitionTo("levelSelect"),
    this, this.confirmSound, this.hoverSound, false, true);
  this.keepPlayingButton = new Button(this.buttonImage, this.menu, this.keepPlayingButtonFrames, () => this.transitionOut(800),
    this, this.confirmSound, this.hoverSound, !this.currentEnding.win, true);

  this.menu.addButton(this.backToMenuButton);
  this.menu.addButton(this.keepPlayingButton);
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
  drawImageToScreen(ctx, this.currentEnding.image, 5, 9, 0, 1, 1, 0, 0);

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
  if (this.currentEnding.keepPlaying) {
    this.keepPlayingButton.paint(ctx, 180, 190, x, y);
    this.backToMenuButton.paint(ctx, 180, 166, x, y);
  } else {
    this.backToMenuButton.paint(ctx, 180, 178, x, y);
  }

};

GameOverStage.prototype.onkey = function(event) {
  if (this.time > 800) {
    if (["ArrowUp", "w"].indexOf(event.key) >= 0) {
      this.menu.prev();
    }
    if (["ArrowDown", "s"].indexOf(event.key) >= 0) {
      this.menu.next();
    }
    if (["Enter"].indexOf(event.key) >= 0) {
      this.menu.executeFocusedButton();
    }
  }
}
