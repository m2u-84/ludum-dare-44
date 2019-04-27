
function LoadStage() {
  Stage.call(this, "load", 5);
}
inherit(LoadStage, Stage);

LoadStage.prototype.preload = function() {
}

LoadStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }
  // Bar at the bottom
  ctx.fillStyle = "#666";
  ctx.fillRect(0, h + 1, w, 4);
  // Black background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  // Message
  const alpha = (0.7 + 0.2 * Math.sin(timer.runTime * 0.003));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.font = "32px Arial";
  const percentage = Math.round(loader.progress * 100) + "%";
  ctx.fillText("Loading " + percentage, w - 30, h - 30);
};