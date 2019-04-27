
function ContextMenuStage() {
  this.patient = null;
  this.actions = [];
  Stage.call(this, "context", 5);
}
inherit(ContextMenuStage, Stage);

ContextMenuStage.prototype.preload = function() {
};

ContextMenuStage.prototype.prestart = function(payload) {
  this.patient = payload.patient;
  this.actions = this.patient ? this.patient.getActions() : [];
};

ContextMenuStage.prototype.update = function(timer) {
  if (this.actions.length < 1) {
    this.close();
  }
};

ContextMenuStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  // Black background
  ctx.globalAlpha = p * 0.3;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  // Draw Actions
  ctx.globalAlpha = 1;
  ctx.fillStyle = "white";
  for (var i = 0; i < this.actions.length; i++) {
    const action = this.actions[i];
    ctx.fillText((i + 1) + " " + action, w / 2 + 30, 100 + 15 * i);
  }
};

ContextMenuStage.prototype.onkey = function(event) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(event.key) >= 0) {
    this.close();
  } else {
    const num = event.key - 1;
    if (num >= 0 && num < this.actions.length) {
      this.close();
      this.patient.executeAction(this.actions[num]);
    }
  }
};

ContextMenuStage.prototype.close = function() {
  if (this.active) {
    this.transitionOut(300);
  }
};
