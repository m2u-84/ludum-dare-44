
function InstructionsStage() {
  Stage.call(this, "instructions", 8);
}
inherit(InstructionsStage, Stage);

InstructionsStage.prototype.preload = function() {
  this.image = loader.loadImage("./assets/images/modal_intro.png");
}

InstructionsStage.prototype.prestart = function() {
  
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
    this.transitionOut(800);
  }
}