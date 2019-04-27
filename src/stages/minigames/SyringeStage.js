
function SyringeStage() {
  MinigameStage.call(this, "syringe");
}
inherit(SyringeStage, MinigameStage);

SyringeStage.prototype.preload = function() {
  this.syringe = loader.loadImage("assets/syringe.png");
  this.arrow = loader.loadImage("assets/arrow.png");
};

SyringeStage.prototype.prestart = function() {
  this.isAiming = true;
  this.isFlying = false;
  this.angle = 0;
  this.force = 1;
  this.x = 120;
  this.y = 700;
  this.vx = 0;
  this.vy = 0;
};

SyringeStage.prototype.update = function(timer) {
  this.armLeft = this.w - 220;
  this.armRight = this.w - 30;
  if (this.isAiming) {
    // Aiming (angle)
    if (this.getKeyState(" ")) {
      this.isAiming = false;
      this.forceStartTime = this.time;
    } else {
      this.angle = -0.5 + 0.4 * Math.sin(this.time * 0.003);
    }
  } else if (!this.isFlying) {
    // Setting force
    if (!this.getKeyState(" ")) {
      // Start flight
      this.isFlying = true;
      this.vx = this.force * Math.cos(this.angle);
      this.vy = this.force * Math.sin(this.angle);
    } else {
      this.force = 2 + 1 * Math.sin(-Math.PI/2 + (this.time - this.forceStartTime) * 0.003);
    }
  } else {
    // Flying syringe
    this.updateFlight();
  }
};

SyringeStage.prototype.updateFlight = function() {
  // Move
  this.x += this.vx * this.timeDif;
  this.y += this.vy * this.timeDif;
  // Gravity
  this.vy += this.timeDif * 0.002;
  // Angle according to velocity
  this.angle = Math.atan2(this.vy, this.vx);
  if (this.active && (this.x > this.armLeft || this.y > this.h + 100)) {
    this.x = this.armLeft;
    this.transitionOut();
  }
};


SyringeStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Draw arm
  ctx.fillStyle = "#f0b0a0";
  ctx.fillRect(this.armLeft, 0, this.armRight - this.armLeft, this.h);
  // Draw arrow if aiming
  if (!this.isFlying && !this.isAiming) {
    drawImage(ctx, this.arrow, this.x + 120 * Math.cos(this.angle), this.y + 120 * Math.sin(this.angle),
        this.angle, this.force / 2, 1, 0.25, 0.5);
  }
  // Draw Syringe
  drawImage(ctx, this.syringe, this.x, this.y, this.angle, 1, 1);
};
