
function MouseHandler(target) {
  this.eventTarget = target;
  this.mouse = {
    click: 0,
    absX: 0,
    absY: 0,
    canvasX: 0,
    canvasY: 0,
    x: 0,
    y: 0
  };
  this.initListeners();
  this.transform = {
    offX: 0,
    offY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  };
}

MouseHandler.prototype.initListeners = function() {
  this.eventTarget.addEventListener('mousemove', this.onMouseMove.bind(this));
  this.eventTarget.addEventListener('mousedown', this.onMouseDown.bind(this));
  this.eventTarget.addEventListener('mouseup', this.onMouseUp.bind(this));
}

MouseHandler.prototype.onMouseMove = function(mouseEvent) {
  const coords = getRelativeMouseCoordinates(mouseEvent, this.eventTarget);
  this.mouse.absX = coords[0];
  this.mouse.absY = coords[1];
  this.mouse.canvasX = coords[0] * this.eventTarget.width / this.eventTarget.offsetWidth;
  this.mouse.canvasY = coords[1] * this.eventTarget.height / this.eventTarget.offsetHeight;
  [this.mouse.x, this.mouse.y] = this.transformCoord(this.mouse.canvasX, this.mouse.canvasY);
}

MouseHandler.prototype.onMouseDown = function(mouseEvent) {
  this.mouse.click = 1;
}

MouseHandler.prototype.onMouseUp = function(mouseEvent) {
  this.mouse.click = 0;
}

MouseHandler.prototype.setCanvasTransform = function(offX = 0, offY = 0, scaleX = 1, scaleY = scaleX, rotation = 0, invert = true) {
  if (!invert) {
    // Simply apply transformation
    this.transform.offX = offX;
    this.transform.offY = offY;
    this.transform.scaleX = scaleX;
    this.transform.scaleY = scaleY;
    this.transform.rotation = rotation;
  } else {
    // Reverse transformation
    this.transform.offX = -offX;
    this.transform.offY = -offY;
    this.transform.scaleX = 1/scaleX;
    this.transform.scaleY = 1/scaleY;
    this.transform.rotation = -rotation;
  }
  this.transform.rotationSin = Math.sin(rotation);
  this.transform.rotationCos = Math.cos(rotation);
}

MouseHandler.prototype.transformCoord = function(x, y) {
  // Offset
  x += this.transform.offX;
  y += this.transform.offY;
  // Scale
  x *= this.transform.scaleX;
  y *= this.transform.scaleY;
  // Rotate and return
  return [
    this.transform.rotationCos * x - this.transform.rotationSin * y,
    this.transform.rotationSin * x + this.transform.rotationCos * y
  ];
}
