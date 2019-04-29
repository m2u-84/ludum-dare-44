
function StartStage() {
  Stage.call(this, "start", 4);
}
inherit(StartStage, Stage);

StartStage.prototype.preload = function() {
  // Load images here
}

StartStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }
  // Black background if required?
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  // Image
  // ctx.drawImage(this.image, 0, 0);
  // Bar at the bottom
  ctx.fillStyle = "#666";
  ctx.fillRect(0, h + 1, w, 4);
};

StartStage.prototype.onkey = function(event) {
  if (event.key == "Enter") {
    this.transitionTo("game");
  }
}