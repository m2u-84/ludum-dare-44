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
  this.image = image
  this.frames = frames;
  this.hoverSound = hoverSound;
  this.clickSound = clickSound;
  this.action = action;
  this.frame = 0;
  this.hovered = false;
  this.armed = false;
}

Button.prototype.isHovered = function(x, y) {
    return (
        mouseHandler.mouse.canvasX >= x &&
        mouseHandler.mouse.canvasX < (x + this.image.frameWidth) &&
        mouseHandler.mouse.canvasY >= y &&
        mouseHandler.mouse.canvasY < (y + this.image.frameHeight)
    );
}

Button.prototype.paint = function(ctx, x, y) {

    if (this.hovered && this.armed && !mouseHandler.mouse.click) {
        if (this.clickSound) this.clickSound.play();
        this.action();
        this.hovered = false;
        this.armed = false;
      } else if (this.isHovered(x,y) && this.hovered && mouseHandler.mouse.click) {
        this.armed = true;
        this.frame = getArrayFrame(timer.gameTime / this.frames.armedSpeed, this.frames.armed);
      } else if (this.isHovered(x,y) && !mouseHandler.mouse.click && !this.hovered) {
        this.hovered = true;
        if (this.hoverSound) this.hoverSound.play();
        this.frame = getArrayFrame(timer.gameTime / this.frames.hoveredSpeed, this.frames.hovered);
      } else if (!this.isHovered(x,y)) {
        this.hovered = false;
        this.armed = false;
        this.frame = getArrayFrame(timer.gameTime / this.frames.idleSpeed, this.frames.idle);
      }
      
      drawFrame(ctx, this.image, this.frame, x, y, 0, 1, 1, 0, 0);
};
