
function MinigameStage(name) {
  Stage.call(this, name, 5);
  // Drawable canvas size, updated in render function
  this.w = 0;
  this.h = 0;
  this.margin = 32;
}
inherit(MinigameStage, Stage);

MinigameStage.prototype.preload = function() {
};

MinigameStage.prototype.update = function(timer) {

};

MinigameStage.prototype.render = function(ctx, timer) {
  // Default transition for all minigames
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }
  // Background
  ctx.fillStyle = "#806846";
  this.w = w - 2 * this.margin;
  this.h = h - 2 * this.margin;
  ctx.fillRect(this.margin, this.margin, this.w, this.h);
  ctx.translate(this.margin, this.margin);
  // Clipping
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.w, 0);
  ctx.lineTo(this.w, this.h);
  ctx.lineTo(0, this.h);
  ctx.closePath();
  ctx.clip();
};
