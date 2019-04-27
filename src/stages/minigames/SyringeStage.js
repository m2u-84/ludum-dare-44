
function SyringeStage() {
  MinigameStage.call(this, "syringe");
}
inherit(SyringeStage, MinigameStage);

SyringeStage.prototype.preload = function() {
};

SyringeStage.prototype.update = function(timer) {
  if (this.time > 5000 && this.active) {
    this.transitionOut();
  }
  this.armLeft = this.w - 220;
  this.armRight = this.w - 30;
};


SyringeStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Draw arm
  ctx.fillStyle = "#f0b0a0";
  ctx.fillRect(this.armLeft, 0, this.armRight - this.armLeft, this.h);
  // Draw
};