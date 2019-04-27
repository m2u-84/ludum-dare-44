

function Timer(minDif, maxDif) {
  this.startTime = Timer.now();
  this.minDif = minDif || 1;
  this.maxDif = maxDif || 100;
  this.realRunTime = 0;
  this.realRunTimeDif = 0;
  this.runTime = 0;
  this.runTimeDif = 0;
  this.gameTime = 0;
  this.gameTimeDif = 0;
  this.gameTimeSpeed = 1;
  this.lastTime = this.startTime;
  this.lastGameTime = this.startTime;
  this.gameTimeSpeedTransition = null;
  this.paused = false;
}

Timer.now = function () {
  return +Date.now();
};

Timer.prototype.update = function() {
  const newTime = Timer.now();
  let dif = newTime - this.lastTime;
  if (dif >= this.minDif) {
    this.lastTime = newTime;
    this.realRunTimeDif = dif;
    this.realRunTime = newTime - this.startTime;
    dif = Math.min(dif, this.maxDif);
    this.runTimeDif = dif;
    this.runTime += this.runTimeDif;
    this.lastGameTime = this.gameTime;
    if (this.gameTimeSpeedTransition) {
      this.gameTimeSpeed = this.gameTimeSpeedTransition.update(this.realRunTime);
      if (this.gameTimeSpeedTransition.done) {
        this.gameTimeSpeedTransition = null;
      }
    }
    this.gameTimeDif = this.paused ? 0 : dif * this.gameTimeSpeed;
    this.gameTime += this.gameTimeDif;
    return true;
  } else {
    this.realRunTimeDif = 0;
    this.runTimeDif = 0;
    this.gameTimeDif = 0;
    return false;
  }
};

Timer.prototype.pause = function() {
  this.paused = true;
};

Timer.prototype.resume = function() {
  this.paused = false;
};

Timer.prototype.setGameSpeed = function(speed, duration) {
  if (duration) {
    this.gameTimeSpeedTransition = new Transition(this.gameTimeSpeed, speed, duration, "cubic", this.realRunTime);
  } else {
    this.gameTimeSpeed = speed;
  }
};

