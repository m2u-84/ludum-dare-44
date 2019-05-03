


function FloatingText(t, x, y, color = "money") {
  this.text = t;
  this.x = x;
  this.y = y;
  this.color = color;
  this.startTime = gameStage.time;
  this.lifetime = 4000;
  this.fadeOutDuration = 1000;
  this.fadeInDuration = 300;
}

FloatingText.prototype.render = function(ctx) {
  // Update
  const age = gameStage.time - this.startTime;
  if (age > this.lifetime) {
    return true;
  }
  // Still alive, render
  let alpha = 1;
  if (age > this.lifetime - this.fadeOutDuration) {
    const p = mapRange(age, this.lifetime - this.fadeOutDuration, this.lifetime, 0, 1);
    alpha = 1 - p;
  } else if (age < this.fadeInDuration) {
    alpha = age / this.fadeInDuration;
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(this.x, this.y - age / 5000 - 1);
  ctx.scale(1/24, 1/24);
  mainFont.drawText(ctx, this.text, 0, 0, this.color, 0.5, BitmapFontStyle.SHADOW);
  ctx.restore();
}