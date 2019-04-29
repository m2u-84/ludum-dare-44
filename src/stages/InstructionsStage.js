
function InstructionsStage() {
  Stage.call(this, "instructions", 8);
}
inherit(InstructionsStage, Stage);

InstructionsStage.prototype.preload = function() {
  const ASSETS_BASE_PATH = './assets/';
  const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
  const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

  this.image = loader.loadImage(IMAGES_BASE_PATH + 'modal_intro.png');

  this.soundSliding = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/paper-sliding/paper-sliding.mp3'});
}

InstructionsStage.prototype.prestart = function() {
  this.soundSliding.play();
}

InstructionsStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);


  // Black background
  ctx.globalAlpha = 0.5 * p;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);

  // Image
  ctx.globalAlpha = 1;
  const y = (h - this.image.height) / 2 - ( (10 / p) - 10);
  const x = (w - this.image.width) / 2;
  ctx.translate(x, y);
  drawImageToScreen(ctx, this.image, 0, 0, 0, 1, 1, 0, 0);

};

InstructionsStage.prototype.onkey = function(event) {
  if (this.active && event.key == " ") {
    this.soundSliding.play();

    this.transitionOut(800);
  }
}
