

function StageManager(canvas, timer) {
  this.allStages = [];
  this.activeStage = null;
  this.currentStages = [];
  this.transitions = [];
  this.defaultDuration = 1000;
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.timer = timer || new Timer();
  this.sharedValues = {};

  // Register Event Listeners
  document.body.addEventListener("keydown", this.handleKeyDown.bind(this));
  canvas.addEventListener("click", this.handleKeyDown.bind(this));
}

StageManager.prototype.load = function() {
  this.allStages.forEach(stage => {
    stage.preload();
  });
};

StageManager.prototype.add = function(stage) {
  stage.setManager(this);
  this.allStages.push(stage);
  if (!this.activeStage) {
    this.setInstant(stage);
  }
  return this;
};

StageManager.prototype.shareValue = function(key, value, stage) {
  if (this.sharedValues.hasOwnProperty(key)) {
    throw new Error("Can't share key '" + key + "' from stage " + stage.name + ", as key is already shared");
  }
  this.sharedValues[key] = value;
};

StageManager.prototype.getSharedValue = function(key, stage) {
  if (!this.sharedValues.hasOwnProperty(key)) {
    throw new Error("Can't retreive shared key '" + key + "' from stage " + stage.name + ", as this key has not been registered");
  }
  return this.sharedValues[key];
};

StageManager.prototype.setInstant = function(stage) {
  this.crossfadeToStage(stage, 0);
};

StageManager.prototype.fadeOutStage = function(fadeDuration = this.defaultDuration, activatePrevious = true) {
  if (activatePrevious && this.currentStages.length < 2) {
    throw new Error("Can't fade out root stage: " + this.activeStage.name);
  }
  const prevStage = this.activeStage;
  prevStage.prestop();
  prevStage.active = false;
  if (activatePrevious) {
    this.activeStage = this.currentStages[this.currentStages.length - 2];
    this.activeStage.resume();
    this.activeStage.active = true;
  }
  // Fade out
  if (fadeDuration > 0) {
    this.transitions.push({
      stage: prevStage,
      fadeIn: false,
      transition: new Transition(prevStage.opacity, 0, fadeDuration, undefined, this.timer.runTime)
    });
  } else {
    // Instantly remove fading out stage from stack
    this.currentStages = this.currentStages.filter(stage => stage != prevStage);
    prevStage.alive = false;
    prevStage.opacity = 0;
    prevStage.stop();
  }
};

StageManager.prototype.fadeInStage = function(stage, fadeDuration = this.defaultDuration) {
  stage = this.get(stage);
  // Check if stage is already active, if so throw error
  if (stage.alive) {
    throw new Error("Can't activate stage that is already active: " + stage.name + " (from " + this.activeStage.name + ")");
  }
  // Load stage first?
  if (stage.load && !stage.isLoaded) {
    stage.load();
    stage.isLoaded = true;
  }
  // Callbacks of previous and new stage
  if (this.activeStage) {
    this.activeStage.active = false;
  }
  stage.prestart();
  stage.active = true;
  stage.alive = true;
  // Fade in
  if (fadeDuration > 0) {
    this.transitions.push({
      stage: stage,
      fadeIn: true,
      transition: new Transition(stage.opacity, 1, fadeDuration, undefined, this.timer.runTime)
    });
  } else {
    // Instantly activate new stage
    stage.opacity = 1;
    stage.start();
  }
  // Push to stack
  this.currentStages.push(stage);
  this.activeStage = stage;
};

StageManager.prototype.crossfadeToStage = function(stage, fadeDuration = this.defaultDuration, fadeInDuration = fadeDuration) {
  if (this.activeStage)
    this.fadeOutStage(fadeDuration, false);
  this.fadeInStage(stage, fadeInDuration);
};

StageManager.prototype.get = function(stage) {
  if (typeof stage === "string") {
    const foundStage = this.allStages.find(s => s.name == stage);
    if (foundStage) {
      return foundStage;
    }
  }
  if (!this.allStages.find(s => s == stage)) {
    throw new Error("Tried to get stage that isn't managed by StageManager: ")
  }
  return stage;
};

StageManager.prototype.update = function() {
  // Transitions
  let changes = 0;
  for (let t = this.transitions.length - 1; t >= 0; t--) {
    const v = this.transitions[t].transition.update(this.timer.runTime);
    this.transitions[t].stage.opacity = v;
    // Handle end of transition
    if (this.transitions[t].transition.done) {
      this.transitions[t].stage.alive = !!this.transitions[t].fadeIn;
      if (this.transitions[t].stage.alive) {
        // Fade in ready
        this.transitions[t].stage.start();
      } else {
        // Fade out ready
        this.transitions[t].stage.stop();
        // Remove stage from current stages stack
        this.currentStages = this.currentStages.filter(stage => stage != this.transitions[t].stage);
      }
      // Clear duplicates
      for (let j = t - 1; j >= 0; j--) {
        if (this.transitions[j].stage == this.transitions[t].stage) {
          this.transitions.splice(j, 1);
          t--;
        }
      }
      // Remove transition
      this.transitions.splice(t, 1);
    }
  }
  // Stages
  for (let stage of this.allStages) {
    if (stage.alive) {
      // Update stage timing
      stage.aliveTimeDif = this.timer.gameTimeDif * stage.opacity;
      stage.aliveTime += stage.aliveTimeDif;
      if (stage.active) {
        stage.timeDif = this.timer.gameTimeDif * stage.opacity;
        stage.time += stage.timeDif;
      } else {
        if (this.currentStages[this.currentStages.length - 2] == stage && this.activeStage.opacity < 1) {
          stage.timeDif = this.timer.gameTimeDif * (1 - this.activeStage.opacity);
          stage.time += stage.timeDif;
        } else {
          stage.timeDif = 0;
        }
      }
      stage.update(this.timer);
    } else {
      stage.aliveTimeDif = 0;
    }
  }
};

StageManager.prototype.render = function() {
  // Clear canvas
  this.context.setTransform(1, 0, 0, 1, 0, 0);
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  // Sort active stages by their z-index
  const activeStages = this.allStages.filter(stage => stage.alive && stage.opacity > 0);
  // Sort by z-index
  activeStages.sort((s1, s2) => s1.zIndex - s2.zIndex);
  // Stages
  for (let stage of activeStages) {
    this.context.save();
    stage.render(this.context, this.timer);
    this.context.restore();
  }
};

StageManager.prototype.handleKeyDown = function(event) {
  this.activeStage.onkey(event);
};
