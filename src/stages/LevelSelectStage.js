
function LevelSelectStage() {
  Stage.call(this, "levelSelect", 4);
}
inherit(LevelSelectStage, Stage);

LevelSelectStage.prototype.preload = function() {
  // Load images here
  this.bgImage = loader.loadAssetImage('level_select_stage.png');
  this.scoreIcon = loader.loadAssetImage('levelscore.png', 2, 1);
  this.levelSelectButtonImage = loader.loadAssetImage('level_select_button.png', 4, 2);
  this.hoverSound = loader.loadAssetAudio({src: 'sounds/key-clicking/key-clicking.mp3'});
  this.startingSound = loader.loadAssetAudio({src: 'sounds/game-starting/game-starting.mp3'});

  const levelButtonFrames = {
    idle: [0, 1, 2, 3, 2, 1],
    idleSpeed: 175,
    hovered: [4, 5, 6, 5],
    hoveredSpeed: 150,
    armed: [7],
    armedSpeed: 75
  }

  this.level1Button = new Button(this.levelSelectButtonImage, levelButtonFrames, () => this.startGame(1), undefined, this.hoverSound);
  this.level2Button = new Button(this.levelSelectButtonImage, levelButtonFrames, () => this.startGame(2), undefined, this.hoverSound);
}

LevelSelectStage.prototype.startGame = function(level) {
  this.startingSound.play();
  if (gameStage.gameState) {
    gameStage.prestart({level: level, isMale: level == 1});
    this.transitionOut();
  } else {
    this.transitionTo("game", undefined, {level: level, isMale: level == 1});
  }
};

LevelSelectStage.prototype.prestart = function() {
}

LevelSelectStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }
  // Draw background image
  drawImage(ctx, this.bgImage, 0, 0, 0, 1, 1, 0, 0);

  // Draw Highscores

  drawFrame(ctx, this.scoreIcon, gameStage.getHighScore(1) ? 0 : 1, 28, 66, 0, 1, 1, 0, 0);
  mainFont.drawText(ctx, gameStage.getHighScore(1) ? gameStage.getHighScore(1) +' points' : 'no highscore', 54, 72, gameStage.getHighScore(1) ? 'green' : 'gray' , 0);

  drawFrame(ctx, this.scoreIcon, gameStage.getHighScore(2) ? 0 : 1, 28+182, 66, 0, 1, 1, 0, 0);
  mainFont.drawText(ctx, gameStage.getHighScore(2) ? gameStage.getHighScore(2) +' points' : 'no highscore', 54+182, 72, gameStage.getHighScore(2) ? 'green' : 'gray' , 0);


  // Draw Menu Buttons
  this.level1Button.paint(ctx, 26, 86);
  this.level2Button.paint(ctx, 208, 86);
};
