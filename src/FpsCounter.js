

function FpsCounter(updateDelay = 1000) {
  this.updateDelay = updateDelay;
  this.lastUpdate = +Date.now();
  this.frameCount = 0;
  this.currentFPS = 0;
}

FpsCounter.prototype.update = function() {
  this.frameCount++;
  this.currentTime = +Date.now();
  const diff = this.currentTime - this.lastUpdate;
  if (diff >= 1000) {
    this.currentFPS = this.frameCount;
    this.frameCount = 0;
    this.lastUpdate = this.currentTime ;
  }
  return this.currentFPS;
};
