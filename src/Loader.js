

function Loader() {
  this.images = [];
  this.count = 0;
  this.loaded = 0;
  this.errors = 0;
  this.total = 0;
  this.progress = 0;
  this.allAdded = false;
  this.resolver = null;
}

Loader.prototype.loadAll = function() {
  var self = this;
  this.allAdded = true;
  if (this.total >= this.count) {
      return Promise.resolve();
  } else {
      return new Promise((resolve, reject) => {
          this.resolver = resolve;
      });
  }
};

Loader.prototype.loadImage = function(src, frameCountX, frameCountY) {
  this.count++;
  var img = new Image();
  img.onload = () => {
      this.loaded++;
      this.total++;
      if (frameCountX) {
          img.frameWidth = img.width / frameCountX;
          img.frameHeight = img.height / frameCountY;
      }
      this.update();
  };
  img.onerror = () => {
      this.errors++;
      this.total++;
      this.update();
  };
  img.src = src;
  if (frameCountX) {
      if (frameCountY == null) { frameCountY = 1; }
      img.frameCount = frameCountX * frameCountY;
      img.frameCountX = frameCountX;
      img.frameCountY = frameCountY;
      img.frameWidth = 1; // updated when loaded
      img.frameHeight = 1;
  }
  return img;
};

Loader.prototype.loadAudio = function(soundData) {
  var sound = new Audio(soundData.src);
  for (let key in soundData) {
      if (key != "src") {
          sound[key] = soundData[key];
      }
  }
  sound.isPlaying = function() {
      return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2)
  }
  sound.stop = function() {
      this.pause();
      this.currentTime = 0;
  }
  sound.trigger = function () {
      if (!this.isPlaying()) {
          this.play();
      }
  }
  sound.setVolume = function(volume) {
      if (this.minVolume && volume < this.minVolume) {
          this.volume = this.minVolume;
      } else if (this.maxVolume && volume > this.maxVolume) {
          this.volume = this.maxVolume;
      } else if (volume < 0) {
          this.volume = 0;
      } else {
          this.volume = volume;
      }
  }
  return sound;
}

Loader.prototype.update = function() {
  if (this.allAdded) {
      this.progress = clamp(this.total / this.count, 0, 1);
      if (this.total >= this.count) {
          if (this.resolver) {
              this.resolver();
          }
      }
  }
};