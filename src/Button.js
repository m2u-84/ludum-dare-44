/**
 * A Button
 * 
 * @param {Number} x           X position 
 * @param {Number} y           Y position
 * @param {Number} w           Width
 * @param {Number} h           Height
 * @param {Image} image        Image Object
 * @param {Object} frames
 * Object with animation frame mapping arrays for each state.
 * {
 *    idle: [9, 10, 11, 12, 13, 8, 8, 8, 8, 8, 8, 8, 8, 8],
 *    hovered: [14],
 *    armed: [15]
 *  }
 * @param {Function} action     Callback function after clicking button
 * @param {Sound} clickSound    Optionl hover sound
 * @param {Sound} hoverSound    Option click sound
 */

function Button(x, y, w, h, image, frames, action, clickSound = null, hoverSound = null) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image = image
    this.frames = frames;
    this.hoverSound = hoverSound;
    this.clickSound = clickSound;
    this.action = action;
    this.frame = 0;
    this.hovered = false;
    this.armed = false;
    console.log(this.hoverSound);
}

Button.load = function() {

};

Button.prototype.update = function() {

};

Button.prototype.isHovered = function() {
    return (
        mouseHandler.mouse.canvasX >= this.x &&
        mouseHandler.mouse.canvasX < (this.x + this.w) &&
        mouseHandler.mouse.canvasY >= this.y &&
        mouseHandler.mouse.canvasY < (this.y + this.h)
    );
}

Button.prototype.paint = function(ctx) {

    if (this.hovered && this.armed && !mouseHandler.mouse.click) {
        if (this.clickSound) this.clickSound.play();
        this.action();
        this.hovered = false;
        this.armed = false;
      } else if (this.isHovered() && this.hovered && mouseHandler.mouse.click) {
        this.armed = true;
        this.frame = getArrayFrame(timer.gameTime / 75, this.frames.armed);
      } else if (this.isHovered() && !mouseHandler.mouse.click && !this.hovered) {
        this.hovered = true;
        if (this.hoverSound) this.hoverSound.play();
        this.frame = getArrayFrame(timer.gameTime / 75, this.frames.hovered);
      } else if (!this.isHovered()) {
        this.hovered = false;
        this.armed = false;
        this.frame = getArrayFrame(timer.gameTime / 75, this.frames.idle);
      }
      
      drawFrame(ctx, this.image, this.frame, this.x, this.y, 0, 1, 1, 0, 0);
};
