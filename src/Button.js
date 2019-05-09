/**
 * A Button
 * 
 * @param {Image} image        Image Object
 * @param {Object} frames
 * Object with animation frame mapping arrays for each state and it's animation speed.
 * {
 *    idle: [9, 10, 11, 12, 13, 8, 8, 8, 8, 8, 8, 8, 8, 8],
 *    idleSpeed: 75,
 *    hovered: [14],
 *    hoveredSpeed: 75,
 *    armed: [15],
 *    armedSpeed: 75,
 *  }
 * @param {Function} action     Callback function after clicking button
 * @param {Sound} clickSound    Optionl hover sound
 * @param {Sound} hoverSound    Option click sound
 */

function Button(image, frames, action, clickSound = null, hoverSound = null) {
  this.image = image;
  this.frames = frames;
  this.hoverSound = hoverSound;
  this.clickSound = clickSound;
  this.action = action;
  this.frame = 0;
  this.hovered = false;
  this.armed = false;
}

Button.prototype.isHovered = function(x, y, offsetX, offsetY) {
    return (
        mouseHandler.mouse.canvasX >= (x + offsetX) &&
        mouseHandler.mouse.canvasX < (x + offsetX + this.image.frameWidth) &&
        mouseHandler.mouse.canvasY >= (y + offsetY) &&
        mouseHandler.mouse.canvasY < (y + offsetY + this.image.frameHeight)
    );
}

/**
 * The Paint method of the button class.
 * 
 * Call this in the render method of the parent stage. If the stages' point of origin is not 0, 0 but translated
 * in some way, apply offsetX and offsetY to adjust the hover calculations since mouse positions are absolute over
 * the whole canvas
 */

Button.prototype.paint = function(ctx, x, y, offsetX = 0, offsetY = 0) {

    if (this.hovered && this.armed && !mouseHandler.mouse.click) {
      if (this.clickSound) this.clickSound.play();
      this.action();
      this.armed = false;
    } else if (this.isHovered(x,y,offsetX,offsetY) && this.hovered && mouseHandler.mouse.click) {
      this.armed = true;
      this.frame = getArrayFrame(timer.gameTime / this.frames.armedSpeed, this.frames.armed);
    } else if (this.isHovered(x,y,offsetX,offsetY) && !mouseHandler.mouse.click) {
      if (!this.hovered) {
        this.hovered = true;
        if (this.hoverSound) this.hoverSound.play();
      } else {
        this.frame = getArrayFrame(timer.gameTime / this.frames.hoveredSpeed, this.frames.hovered);
      }
    } else if (!this.isHovered(x,y,offsetX,offsetY)) {
      this.hovered = false;
      this.armed = false;
      this.frame = getArrayFrame(timer.gameTime / this.frames.idleSpeed, this.frames.idle);
    }
      
      drawFrame(ctx, this.image, this.frame, x, y, 0, 1, 1, 0, 0);
};
