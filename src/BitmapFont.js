

function BitmapFont(src, colors, charMap, charWidths, charMargin = 1) {
  this.sourceImage = new Image();
  this.canvas = document.createElement("canvas");

  this.colorMap = { ... colors };
  // this.colorMap = Object.assign({}, colors);

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

  const originalMap = { ... colorMap };
  // const originalMap = Object.assign({}, colorMap);

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

BitmapFont.prototype.drawText = function(ctx, text, x, y, color, align = 0) {
  text = ""+text;
  if (!this.ready) { return; }
  let width = 0;
  for (var char of text) {
    const index = this.getCharIndex(char);
    width += this.charWidths[index] + 1;
  }
  const offX = Math.round(-align * width);
  for (let i = 0; i < text.length; i++) {
    const index = this.getCharIndex(text[i]);
    this.drawCharacter(ctx, index, x + offX, y, color);
    x += this.charWidths[index] + 1;
  }
};
