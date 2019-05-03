

function CashflowFeed() {
  this.texts = [];
}

CashflowFeed.prototype.addText = function(text, color) {
  const item = new CasfhlowItem(text, color);
  this.texts.push(item);
};

CashflowFeed.prototype.clear = function() {
  this.texts = [];
};

CashflowFeed.prototype.draw = function(ctx) {
  ctx.save();
  ctx.translate(Math.floor(ctx.canvas.width / 2), 8);
  for (var i = 0; i < this.texts.length; i++) {
    this.texts[i].drawAndUpdate(ctx, i * 12);
  }
  this.texts = this.texts.filter(t => !t.done);
  ctx.restore();
}

function CasfhlowItem(text, color = "red") {
  this.text = text;
  this.startTime = gameStage.time;
  this.duration = 7000;
  this.endTime = this.startTime + this.duration;
  this.color = color;
  this.p = 0;
  this.y = 0;
  this.done = false;
}

CasfhlowItem.prototype.drawAndUpdate = function(ctx, off) {
  if (gameStage.time >= this.endTime) {
    this.p = 1;
    this.done = true;
    return true;
  }
  this.p = (gameStage.time - this.startTime) / this.duration;
  const alpha = this.p < 0.1 ? (this.p / 0.1) : this.p > 0.9 ? (1 - this.p) / 0.1 : 1;
  ctx.globalAlpha = alpha;
  const backAlpha = 0.4 + 0.12 * Math.sin(gameStage.time * 0.006);
  mainFont.drawText(ctx, this.text, 0, this.y + off, this.color, 0.5, BitmapFontStyle.SHADOW, "rgba(0, 0, 0," + backAlpha + ")");
};
