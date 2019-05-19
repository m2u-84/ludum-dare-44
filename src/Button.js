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

function Button(image, menu = undefined, frames, action, stage = null, clickSound = null, hoverSound = null, disabled = false, drawPointer = false) {
  this.refId = uuidv4();
  this.image = image;
  this.frames = frames;
  this.hoverSound = hoverSound;
  this.clickSound = clickSound;
  this.action = action;
  this.frame = 0;
  this.pointerFrame = 0;
  this.stage = stage;
  this.hovered = false;
  this.armed = false;
  this.disabled = disabled;
  this.drawPointer = drawPointer;
  this.pointer = {};
  this.menu = menu;

  if (this.drawPointer) {
    this.pointer = this.stage.getShared('pointer');
  }
}

Button.prototype.isHovered = function(x, y, offsetX, offsetY) {
  const mouse = this.getMouse();
  return (
      mouse.canvasX >= (x + offsetX) &&
      mouse.canvasX <  (x + offsetX + this.image.frameWidth) &&
      mouse.canvasY >= (y + offsetY) &&
      mouse.canvasY <  (y + offsetY + this.image.frameHeight)
  );
}

Button.prototype.focus = function() {
  this.focused = true;
  if (this.hoverSound) this.hoverSound.play();
}

Button.prototype.blur = function() {
  console.log('blur');
  this.focused = false;
  this.hovered = false;
  this.armed = false;
}

Button.prototype.execute = function() {
  this.armed = false;
  if (this.clickSound) this.clickSound.play();
  this.action();
}

/**
 * The Paint method of the button class.
 * 
 * Call this in the render method of the parent stage. If the stages' point of origin is not 0, 0 but translated
 * in some way, apply offsetX and offsetY to adjust the hover calculations since mouse positions are absolute over
 * the whole canvas
 */

Button.prototype.paint = function(ctx, x, y, offsetX = 0, offsetY = 0) {
  const mouse = this.getMouse();

  // if (this.focused && this.armed && !mouse.click) {
  //   if (this.clickSound) this.clickSound.play();
  //   this.action();
  //   this.armed = false;
  // } else if (this.isHovered(x,y,offsetX,offsetY) && this.focused && mouse.click) {
  //   this.armed = true;
  //   this.frame = getArrayFrame(timer.gameTime / this.frames.armedSpeed, this.frames.armed);
  // } else if (this.isHovered(x,y,offsetX,offsetY) && !mouse.click) {
  //   if (!this.focused) {
  //     this.focus()
  //   } else {
  //     this.frame = getArrayFrame(timer.gameTime / this.frames.hoveredSpeed, this.frames.hovered);
  //   }
  // } else if (!this.isHovered(x,y,offsetX,offsetY)) {
  //   this.hovered = false;
  //   this.armed = false;
  //   if (!this.focused)
  //     this.frame = getArrayFrame(timer.gameTime / this.frames.idleSpeed, this.frames.idle);
  // }

  // Button is focused
  
  if (this.focused) {
    // Draw pointer on focused button if wanted
    if (this.drawPointer) {
      this.pointerFrame = getArrayFrame(timer.gameTime / 35, this.pointer.frames);
    }

    if (this.armed) {
      // focused AND armed
      this.frame = getArrayFrame(timer.gameTime / this.frames.armedSpeed, this.frames.armed);

      // Allow button execution with mouse if button is already armed
      if (!mouse.click && this.isHovered(x,y,offsetX,offsetY)) {
        this.execute();
      }
    } else {
      // just focused
      this.frame = getArrayFrame(timer.gameTime / this.frames.hoveredSpeed, this.frames.hovered);
    }

    // Allow button arming with mouse
    if (!this.armed && this.focused && mouse.click && this.hovered && this.isHovered(x,y,offsetX,offsetY))  {
      this.armed = true;
    }
  }

  // Button is NOT focused
  if (!this.focused) {
    this.frame = getArrayFrame(timer.gameTime / this.frames.idleSpeed, this.frames.idle);
  }

  // General mouse control logic to prevent unexpected click and hover behaviour
  if (!mouse.click) {
    if (this.isHovered(x,y,offsetX,offsetY)) {
      if (!this.hovered) this.hovered = true;
      if (!this.focused) this.menu.switchFocusTo(this.refId)
    } else {
      if (this.armed) this.armed = false;
    }
  } else {
    if (this.hovered) this.hovered = false;
  }

  drawFrame(ctx, this.image, this.frame, x, y, 0, 1, 1, 0, 0);
  if (this.focused && this.drawPointer) drawFrame(ctx, this.pointer.image, this.pointerFrame, x, Math.floor((y + this.image.frameHeight / 2)), 0, 1, 1, 0.5, 0.5);
};

Button.prototype.getMouse = function() {
  const mouse = this.stage ? this.stage.getMouse() : mouseHandler.mouse;
  return mouse;
};