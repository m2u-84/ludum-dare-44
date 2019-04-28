
function SyringeStage() {
  MinigameStage.call(this, "syringe");
}
inherit(SyringeStage, MinigameStage);

SyringeStage.prototype.preload = function() {
  this.syringe = loader.loadImage("assets/images/syringe.png");
  this.arrow = loader.loadImage("assets/images/arrow.png");
  this.arm = loader.loadImage("assets/images/arm.png");
  this.hand = loader.loadImage("assets/images/darthand_back.png");
  this.thumb = loader.loadImage("assets/images/darthand_front.png");
};

SyringeStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.antibiotics;
  this.isAiming = true;
  this.isFlying = false;
  this.angle = 0;
  this.force = 0;
  this.vx = 0;
  this.vy = 0;
};

SyringeStage.prototype.update = function(timer) {
  this.targetY = this.h * 0.6;
  this.armLeft = this.w - 90;
  this.armRight = this.w - 30;
  this.armCenter = (this.armLeft + this.armRight) / 2;
  if (!this.isFlying) {
    this.x = this.w * 0.2 + 10 * wobble(this.time, 8, 0, 2);
    this.y = this.h * 0.75 + 10 * wobble(this.time, 13.7, 1, 2);
  }
  if (this.isAiming) {
    // Aiming (angle)
    if (this.getKeyState(" ")) {
      this.isAiming = false;
      this.forceStartTime = this.time;
    } else {
      this.angle = -0.3 + 0.3 * Math.sin(this.time * 0.003);
      this.handAngle = -0.2 + 0.2 * Math.sin(this.time * 0.003 + 0.6);
    }
  } else if (!this.isFlying) {
    // Setting force
    if (!this.getKeyState(" ")) {
      // Start flight
      this.isFlying = true;
      this.vx = this.force * Math.cos(this.angle);
      this.vy = this.force * Math.sin(this.angle);
    } else {
      this.force = 0.9 + 0.3 * Math.sin(-Math.PI/2 + (this.time - this.forceStartTime) * 0.003);
    }
  } else {
    // Flying syringe
    this.updateFlight();
  }
};

SyringeStage.prototype.updateFlight = function() {
  // Move
  const f = this.timeDif * 0.75;
  this.x += this.vx * f;
  this.y += this.vy * f;
  // Gravity
  this.vy += f * 0.002;
  // Angle according to velocity
  this.angle = Math.atan2(this.vy, this.vx);
  if (this.active && (this.x > this.armLeft - 20 || this.y > this.h + 100)) {
    this.x = this.armLeft - 20;
    this.success = (Math.abs(this.y - this.targetY) < 0.12 * this.h);
    this.transitionOut();
  }
};


SyringeStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Draw arm
  drawImage(ctx, this.arm, this.armCenter, this.h, 0, 1, 1, 0.5, 1);
  // Draw arrow if aiming
  if (!this.isFlying && !this.isAiming) {
    drawImage(ctx, this.arrow, this.x + 50 * Math.cos(this.angle), this.y + 50 * Math.sin(this.angle),
        this.angle, this.force, 0.5, 0.25, 0.5);
  }
  // Draw back of hand
  const hangle = this.handAngle;
  drawImage(ctx, this.hand, this.x, this.y, hangle, 1, 1, 0.85, 0.12);
  // Draw Syringe
  drawImage(ctx, this.syringe, this.x, this.y, this.angle, 0.75);
  // Draw thumb
  drawImage(ctx, this.thumb, this.x, this.y, hangle, 1, 1, 0.85, 0.12);
};
