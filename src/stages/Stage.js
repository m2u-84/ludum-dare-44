


function Stage(name, zIndex) {
  this.name = name;
  this.manager = null;
  this.zIndex = zIndex || 0;
  this.active = false; // only one stage is active at a time, always equal to manager.activeStage
  this.alive = false; // active stage is always alive, others in background can be alive as well
  this.opacity = 0;
  this.isTransparent = false;
  this.isLoaded = false;
  this.time = 0;
  this.timeDif = 0;
  this.aliveTime = 0;
  this.aliveTimeDif = 0;
}

Stage.prototype.setManager = function(manager) {
  this.manager = manager;
};

Stage.prototype.transitionTo = function(stage, duration) {
  this.manager.crossfadeToStage(stage, duration);
};

Stage.prototype.transitionIn = function(stage, duration) {
  this.manager.fadeInStage(stage, duration);
};

Stage.prototype.transitionOut = function(duration) {
  if (!this.active) {
    throw new Error("Stage can't transition out when it's not active: " + this.name + ". Active stage is " + this.manager.activeStage.name);
  }
  this.manager.fadeOutStage(duration);
}

Stage.prototype.share = function(key, value) {
  this.manager.shareValue(key, value, this);
};

Stage.prototype.getShared = function(key) {
  return this.manager.getSharedValue(key, this);
};

Stage.prototype.getKeyState = function(key) {
  if (this.active) {
    return keyHandler.keyStates[key];
  } else {
    return false;
  }
};

Stage.prototype.getMouse = function() {
  if (this.active) {
    return mouse;
  } else {
    return {
      click: 0,
      absX: NaN,
      absY: NaN,
      canvasX: NaN,
      canvasY: NaN,
      x: NaN,
      y: NaN
    };
  }
};

Stage.prototype.render = function(ctx, timer) {

};

Stage.prototype.update = function(timer) {

};

Stage.prototype.preload = function() {

};

Stage.prototype.prestart = function() {

};

Stage.prototype.resume = function() {

};

Stage.prototype.start = function() {

};

Stage.prototype.prestop = function() {

};

Stage.prototype.stop = function() {

};

Stage.prototype.preterminate = function() {

};

Stage.prototype.onkey = function(event) {

};
