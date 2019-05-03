

function BitmapFont(src, colors, charMap, charWidths, charMargin = 1, shadowColorName = "shadow", outlineColorName = "outline") {
  this.sourceImage = new Image();
  this.canvas = document.createElement("canvas");

  // this.colorMap = { ... colors };
  this.colorMap = Object.assign({}, colors);

  this.shadowColor = shadowColorName;
  this.outlineColor = outlineColorName;

  this.ready = false;
  this.sourceImage.onload = () => {
    this.prepareColors(this.colorMap);
    this.ready = true;
  }
  this.sourceImage.src = src;
  this.charMap = charMap;
  this.charWidths = charWidths;
  this.charStartPoints = [];
  this.charCount = charMap.length;
  this.charReverseMap = {};
  for (var i = 0; i < this.charCount; i++) {
    this.charStartPoints[i] = (i == 0) ? 0 : this.charStartPoints[i - 1] + this.charWidths[i - 1] + charMargin;
    const char = this.charMap[i];
    this.charReverseMap[char] = i;
  }
}

BitmapFont.prototype.prepareColors = function(colorMap) {

  // const originalMap = { ... colorMap };
  const originalMap = Object.assign({}, colorMap);

  const colors = Object.keys(colorMap);
  const count = colors.length;
  const w = this.canvas.width = this.sourceImage.width;
  const h = this.sourceImage.height;
  this.canvas.height = h * count;
  this.charHeight = h;
  const ctx = this.canvas.getContext("2d");
  // Fill with font
  for (let i = 0; i < count; i++) {
    colorMap[colors[i]] = i;
    ctx.drawImage(this.sourceImage, 0, h * i);
  }
  // Colorize
  ctx.globalCompositeOperation = "source-in";
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = originalMap[colors[i]];
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, h * i, w , h);
    ctx.clip();
    ctx.fillRect(0, 0, w, h * count);
    ctx.restore();
  }
  ctx.globalCompositeOperation = "source-over";
};

BitmapFont.prototype.getCharIndex = function(char) {
  let charIndex = this.charReverseMap[char];
  if (charIndex == null) {
    // Maybe other case is available
    charIndex = this.charReverseMap[char.toLowerCase()];
    if (charIndex == null) {
      // Maybe other case is available
      charIndex = this.charReverseMap[char.toUpperCase()];
      if (charIndex == null) {
        // To signalize error, use random character
        charIndex = rndInt(0, this.charCount);
      }
    }
  }
  return charIndex;
}

BitmapFont.prototype.drawCharacter = function(ctx, char, x, y, color) {
  if (!this.ready) { return; }
  color = this.colorMap[color];
  const charIndex = (typeof char == "number") ? char : this.getCharIndex(char);
  const charX = this.charStartPoints[charIndex], charY = color * this.charHeight;
  ctx.drawImage(this.canvas, charX, charY, this.charWidths[charIndex], this.charHeight, x, y, this.charWidths[charIndex], this.charHeight);
};

BitmapFontStyle = {
  NONE: 0,
  SHADOW: 1,
  OUTLINE: 2,
  CROSSOUTLINE: 3,
  FULLOUTLINE: 4,
  BACKGROUND: 5
};

BitmapFont.prototype.drawText = function(ctx, text, x, y, color, align = 0, style = BitmapFontStyle.NONE, backgroundColor = null) {
  if (style) {
    switch (style) {
      case BitmapFontStyle.SHADOW:
        this.drawText(ctx, text, x, y + 1, this.shadowColor, align, BitmapFontStyle.NONE);
        break;
      case BitmapFontStyle.OUTLINE:
        for (var off of [[-1,0],[1,0],[0,1],[0,-1]]) {
          this.drawText(ctx, text, x + off[0], y + off[1], this.outlineColor, align, BitmapFontStyle.NONE);
        }
        break;
      case BitmapFontStyle.CROSSOUTLINE:
        for (var off of [[-1,1],[1,1],[1,-1],[-1,-1]]) {
          this.drawText(ctx, text, x + off[0], y + off[1], this.outlineColor, align, BitmapFontStyle.NONE);
        }
        break;
      case BitmapFontStyle.FULLOUTLINE:
        for (var off of [[-1,-1],[0,-1],[1,-1], [-1,0],[1,0], [-1,1],[0,1],[1,1]]) {
          this.drawText(ctx, text, x + off[0], y + off[1], this.outlineColor, align, BitmapFontStyle.NONE);
        }
        break;
    }
  }
  text = ""+text;
  if (!this.ready) { return; }
  let width = 0;
  for (var char of text) {
    const index = this.getCharIndex(char);
    width += this.charWidths[index] + 1;
  }
  const offX = Math.round(-align * width);
  // Draw background?
  if (backgroundColor) {
    this.drawBackground(ctx, backgroundColor, x + offX, y, width, 8);
  }
  for (let i = 0; i < text.length; i++) {
    const index = this.getCharIndex(text[i]);
    this.drawCharacter(ctx, index, x + offX, y, color);
    x += this.charWidths[index] + 1;
  }
};

BitmapFont.prototype.drawBackground = function(ctx, color, x1, y1, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x1 - 1, y1 - 1, w + 2, h + 2);
};
