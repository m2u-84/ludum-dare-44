
function PauseStage() {
  Stage.call(this, "pause", 8);
}
inherit(PauseStage, Stage);

PauseStage.prototype.preload = function() {
}

PauseStage.prototype.prestart = function() {
  this.angleOffset = rnd(10);
}

PauseStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  const out = 1 - p;
  // Black background
  ctx.globalAlpha = 0.5 * p;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  // Message
  const textX = w * (0.5 + 0.3 * wobble(this.time, 1, 0, 2)),
    textY = h * (0.4 + 0.25 * wobble(this.time, 1.6, 1, 3) - 0.7 * out),
    angle = this.opacity * 1.5 * wobble(this.time, 2.5, this.angleOffset, 1);
  ctx.textAlign = "center";
  ctx.font = "32px Arial";
  ctx.save();
  ctx.shadowColor = "black";
  ctx.shadowBlur = 3;
  ctx.translate(textX, textY + 8);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "black";
  ctx.fillText("GAME PAUSED", 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(textX, textY);
  ctx.rotate(angle);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "white";
  ctx.fillText("GAME PAUSED", 0, 0);
  ctx.restore();
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.globalAlpha = 0.8 + 0.2 * wobble(this.time, 10);
  ctx.fillText("Press Escape to Care About More People", w / 2, h * (0.94 + 0.2 * out));
};

PauseStage.prototype.onkey = function(event) {
  if (this.active && event.key == "Escape") {
    this.transitionOut(400);
  }
}