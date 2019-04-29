

function CashflowFeed() {
  this.texts = [];
}

CashflowFeed.prototype.addText = function(text, color) {
  const item = new CasfhlowItem(text, color);
  this.texts.push(item);
};

CashflowFeed.prototype.draw = function(ctx) {
  ctx.save();
  ctx.translate(Math.floor(ctx.canvas.width / 2) + 0.5, 5);
  this.texts.forEach(t => t.drawAndUpdate(ctx));
  this.texts = this.texts.filter(t => !t.done);
  ctx.restore();
}

function CasfhlowItem(text, color = "red") {
  this.text = text;
  this.startTime = gameStage.time;
  this.duration = 5000;
  this.endTime = this.startTime + this.duration;
  this.color = color;
  this.p = 0;
  this.y = 0;
  this.done = false;
}

CasfhlowItem.prototype.drawAndUpdate = function(ctx) {
  if (gameStage.time >= this.endTime) {
    this.p = 1;
    this.done = true;
    return true;
  }
  this.p = (gameStage.time - this.startTime) / this.duration;
  const alpha = this.p < 0.2 ? (this.p / 0.2) : this.p > 0.8 ? (1 - this.p) / 0.2 : 1;
  ctx.globalAlpha = alpha;
  mainFont.drawText(ctx, this.text, 0, this.y, this.color, 0.5);
};
