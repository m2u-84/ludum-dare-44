
function ContextMenuStage() {
  this.patient = null;
  this.actions = [];
  Stage.call(this, "context", 5);
}
inherit(ContextMenuStage, Stage);

ContextMenuStage.prototype.preload = function() {
  this.background = loader.loadImage("assets/patientsheet.png");
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
  const p = Interpolators.cubic(this.opacity);
  // Black background
  ctx.globalAlpha = p * 0.3;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  // Background
  ctx.globalAlpha = 1;
  const y = (h - this.background.height) / 2;
  const x = w - this.background.width * p;
  drawImageToScreen(ctx, this.background, x, y, 0, 1, 1, 0, 0);
  // Draw Actions
  ctx.fillStyle = "white";
  for (var i = 0; i < this.actions.length; i++) {
    const action = this.actions[i];
    mainFont.drawText(ctx, (i + 1) + " " + action, x + 30, y + 100 + 15 * i, "black", 0);
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
