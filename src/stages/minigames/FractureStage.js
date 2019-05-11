
function FractureStage() {
  MinigameStage.call(this, "fracture");
  this.helpText = "Press Space to hammer";
}
inherit(FractureStage, MinigameStage);

FractureStage.prototype.preload = function() {
  MinigameStage.prototype.preload.call(this);

  this.upperLeg = loader.loadAssetImage('hammer_leg_back.png');
  this.lowerLeg = loader.loadAssetImage('hammer_leg_front.png');
  this.nailImage = loader.loadAssetImage('hammer_nail.png');
  this.hammerImage = loader.loadAssetImage('hammer_hand.png');
  this.curtainImage = loader.loadAssetImage('curtain.png');

  this.soundWhoosh = loader.loadAssetAudio({src: 'sounds/hammer-hitting/hammer-hitting-whoosh.mp3'});
  this.soundNail = loader.loadAssetAudio({src: 'sounds/hammer-hitting/hammer-hitting-nail.mp3'});
  this.soundKnee = loader.loadAssetAudio({src: 'sounds/hammer-hitting/hammer-hitting-knee.mp3'});
};

FractureStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.fixLeg;
  // Reset minigame logics here
  this.legAngle = 0;
  this.maxLegAngle = 20 * Math.PI / 180;
  if (this.patient.sickness.name == 'Bone Fracture') {
    this.legAngle = rnd(28, 50) * Math.PI / 180 * rndSgn();
    this.maxLegAngle = Math.abs(this.legAngle);
  }
  this.nextNailProgress = rnd(0.2, 0.4);
  this.nailProgress = 0;
  this.misses = 0;
  this.hammerX = 0;
  this.hammerY = 0;
  this.hammerVelocity = 0;
  this.hammering = false;
  this.returning = false;
  this.holding = false;
  this.wellPlaced = false;
};

FractureStage.prototype.update = function(timer) {
  if (this.paused) { return; }
  MinigameStage.prototype.update.call(this, timer);
  this.nailX = 108;
  this.nailY = this.h - 50;
  const wobbleX = 50 * wobble(this.time, 5, 1, 1.6), wobbleY = 15 * wobble(this.time, 8.6, -0.7, 1.2);
  if (!this.hammering && !this.holding && !this.returning) {
    this.hammerX = this.nailX + wobbleX;
    this.hammerY = this.nailY - 100 + wobbleY;
    // Hit nail
    if (this.getKeyState(" ")) {
      this.hammering = true;
      this.hammerVelocity = 0.1;
      this.wellPlaced = Math.abs(this.hammerX - this.nailX) < 10;
    }
  } else {
    if (this.hammering) {
      // Hammer down
      this.soundWhoosh.play();

      this.hammerVelocity += this.timeDif * 0.005;
      this.hammerY += this.hammerVelocity * this.timeDif;
      const maxY = this.wellPlaced ? (this.nailY - 39 + 35 * this.nextNailProgress) : (this.nailY + 6);
      if (this.hammerY >= maxY) {
        this.hammerY = maxY;
        if (this.wellPlaced) {
          this.hitNail();
        } else {
          this.hitPatient();
        }
        this.hammering = false;
        this.holding = true;
        this.holdEnd = this.time + 250;
      }
    } else if (this.returning) {
      // Return from holding position to top
      if (this.time > this.returnEnd) {
        this.returning = false;
      } else {
        const p = Interpolators.cubic2((this.time - this.returnStart) / (this.returnEnd - this.returnStart));
        const p1 = 1 - p;
        this.hammerX = p * (this.nailX + wobbleX) + p1 * this.returnFromX;
        this.hammerY = p * (this.nailY + wobbleY - 100) + p1 * this.returnFromY;
      }
    } else if (this.holding) {
      // Hold hit position
      if (this.time > this.holdEnd) {
        this.holding = false;
        this.returning = true;
        this.returnStart = this.time;
        this.returnEnd = this.returnStart + 320;
        this.returnFromX = this.hammerX;
        this.returnFromY = this.hammerY;
      }
    }
  }
};

FractureStage.prototype.hitNail = function() {
  this.soundNail.play();

  this.nailProgress = this.nextNailProgress;
  this.nextNailProgress += rnd(0.3, 0.6);
  this.nextNailProgress = clamp(this.nextNailProgress, 0, this.nailProgress < 0.84 ? 0.94 : 1);

  if (this.nailProgress >= 1.0) {
    this.nailProgress = 1.0;
    this.close(true);
  }

  this.legAngle = rnd(this.maxLegAngle) * rndSgn();
  this.maxLegAngle = Math.abs(this.legAngle);
};

FractureStage.prototype.hitPatient = function() {
  this.soundKnee.play();

  this.misses++;

  if (this.misses >= 3) {
    this.close(false);
  }
}

FractureStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Leg
  const legy = Math.round(this.nailY + 25);
  const wobbleLeg = (this.patient.sickness == this.treatment.sickness || this.legAngle != 0);
  const lowerLegAngle = this.legAngle + (wobbleLeg ? wobble(this.time, 7) * 0.1 * (1 - this.nailProgress) : 0);
  drawImageToScreen(ctx, this.upperLeg, 0, legy, 0, 1, 1, 0, 0.7);
  drawImageToScreen(ctx, this.lowerLeg, 102, legy - 17, lowerLegAngle, 1, 1, 0.17, 0.4);
  // Nail
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, this.w, this.nailY - 2);
  ctx.clip();
  drawImageToScreen(ctx, this.nailImage, this.nailX, this.nailY, 0, 1, 1, 0.5, 1 - 0.9 * this.nailProgress, 1);
  ctx.restore();
  // Hammer
  drawImageToScreen(ctx, this.hammerImage, Math.round(this.hammerX), Math.round(this.hammerY), 0, -1, 1, 0.95, 0.94);
  // Veal
  drawImageToScreen(ctx, this.curtainImage, this.w * 0.64, 0, 0, 1, 1, 0, 0);
  // MinigameStage handles overlay stuff / UI
  MinigameStage.prototype.renderOnTop.call(this, ctx, timer);
};
