
// Feel free to override this if you're using your own timing system
Transition.getCurrentTime = () => +Date.now();

function Transition(fromValue, toValue, duration, interpolation = "linear", currentTime = Transition.getCurrentTime()) {
  this.from = fromValue;
  this.to = toValue;
  this.p = 0;
  this.value = this.from;
  this.duration = duration;
  this.startTime = currentTime;
  this.endTime = this.startTime + this.duration;
  this.interpolate = (typeof interpolation == "string") ? Interpolators[interpolation] : interpolation;
  this.done = false;
}

Transition.prototype.update = function(currentTime = Transition.getCurrentTime()) {
  if (currentTime > this.endTime) {
    this.done = true;
    return this.value = this.to;
  }
  const p = this.p = Math.max(0, (currentTime - this.startTime) / this.duration);
  return this.value = this.interpolate(p, this.from, this.to);
};
