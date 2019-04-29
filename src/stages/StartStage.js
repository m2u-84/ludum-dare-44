
function StartStage() {
  Stage.call(this, "start", 4);
}
inherit(StartStage, Stage);

StartStage.prototype.preload = function() {
  // Load images here
  this.menuImage = loader.loadImage("./assets/images/menu.png");
}

StartStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }

  drawImage(ctx, this.menuImage, 0, 0, 0, 1, 1, 0, 0);
};

StartStage.prototype.onkey = function(event) {
  if (event.key == "1" || event.key == "2") {
    this.transitionTo("game", undefined, {isMale: event.key == "1"});
  }
}