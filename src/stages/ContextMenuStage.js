
function ContextMenuStage() {
  this.patient = null;
  this.actions = [];
  Stage.call(this, "context", 5);
}
inherit(ContextMenuStage, Stage);

ContextMenuStage.prototype.preload = function() {
  this.background = loader.loadImage("assets/patientsheet.png");
  this.keyImage = loader.loadImage("assets/keys.png", 9, 1);
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
  const self = this;
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
  ctx.translate(x, y);
  drawImageToScreen(ctx, this.background, 0, 0, 0, 1, 1, 0, 0);
  // Draw Patient Overview
  ctx.translate(14, 14);
  // mainFont.drawText(ctx, "" + this.patient.id, 0, 0, "darkgray");
  // mainFont.drawText(ctx, "BUDGET:", 0, 20, "darkgray");
  // mainFont.drawText(ctx, "DIAGNOSIS:", 100, 20, "darkgray");
  ctx.globalAlpha = 0.2;
  const wealth = this.patient.wealthLevel == 1 ? "$" : this.patient.wealthLevel == 2 ? "$$" : "$$$";
  mainFont.drawText(ctx, "$$$", 0, 34, "green");
  ctx.globalAlpha = 1;
  mainFont.drawText(ctx, wealth, 0, 34, "green");
  mainFont.drawText(ctx, "???", 80, 34, "orange");
  
  // Preferred option
  drawOption(72, 1, this.actions[0], "Safe", 50);
  for (var i = 1; i < this.actions.length; i++) {
    const action = this.actions[i];
    const y = 107 + 18 * i;
    drawOption(y, i + 1, action, "Safe", 200);
    ctx.fillStyle = "#00000020";
    ctx.fillRect(20, y + 12, 240, 1);
  }

  function drawOption(y, num, name, safety, price) {
    mainFont.drawText(ctx, name, 20, y, "blue");
    mainFont.drawText(ctx, safety, 140, y, "green");
    drawFrame(ctx, self.keyImage, num - 1, 0, y - 4, 0, 1, 1, 0, 0);
    const priceColor = price == 0 ? "gray" : price > 0 ? "green" : "red";
    const priceString = (price >= 0 ? "+ $ " : "") + price;
    mainFont.drawText(ctx, priceString, 260, y, priceColor, 1);
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
