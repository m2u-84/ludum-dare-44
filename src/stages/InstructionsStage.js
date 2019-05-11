
function InstructionsStage() {
  Stage.call(this, 'instructions', 8);
}
inherit(InstructionsStage, Stage);

InstructionsStage.prototype.preload = function() {
  this.images = {};

  levels.forEach(level => {
    this.images[level.num] = loader.loadAssetImage(level.instruction)
  });

  const introButtonFrames = {
    idle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
    idleSpeed: 75,
    hovered: [6],
    hoveredSpeed: 75,
    armed: [7],
    armedSpeed: 75
  }

  this.buttonImage = loader.loadAssetImage('intro_buttons.png', 8, 1);
  this.soundSliding = loader.loadAssetAudio({src: 'sounds/paper-sliding/paper-sliding.mp3'});
  this.hoverSound = loader.loadAssetAudio({src: 'sounds/key-clicking/key-clicking.mp3'});
  this.confirmSound = loader.loadAssetAudio({src: 'sounds/key-clicking/confirm.mp3'});
  this.introButton = new Button(this.buttonImage, introButtonFrames, function() { stageManager.activeStage.transitionOut(800); }, this.confirmSound, this.hoverSound);
}

InstructionsStage.prototype.prestart = function() {
  this.soundSliding.play();
}

InstructionsStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);


  // Black background
  ctx.globalAlpha = 0.5 * p;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, w, h);

  // Image
  ctx.globalAlpha = 1;
  const y = (h - this.images[gameStage.gameState.currentLevel.num].height) / 2 - ( (10 / p) - 10);
  const x = (w - this.images[gameStage.gameState.currentLevel.num].width) / 2;
  ctx.translate(x, y);
  drawImageToScreen(ctx, this.images[gameStage.gameState.currentLevel.num], 0, 0, 0, 1, 1, 0, 0);

  // Button
  this.introButton.paint(ctx, 101, 110, x, y);

};

InstructionsStage.prototype.onkey = function(event) {
  if (this.active && event.key == " ") {
    this.soundSliding.play();

    this.transitionOut(800);
  }
}
