
function OrganStage() {
  MinigameStage.call(this, "organ");
}
inherit(OrganStage, MinigameStage);

OrganStage.prototype.preload = function() {
  this.organ = loader.loadImage("assets/syringe.png");
  this.hand = loader.loadImage("assets/darthand_back.png");
  this.bodyBack = loader.loadImage("assets/organ_body_back.png");
  this.bodyFront = loader.loadImage("assets/organ_body_front.png");
};

OrganStage.prototype.prestart = function() {
  this.isFlying = false;
  this.vx = 0;
  this.vy = 0;
};

OrganStage.prototype.update = function(timer) {
  this.organX = this.w * 0.5;
  if (!this.isFlying) {
    const t = this.time * 0.001;
    this.x = this.w * (0.5 + 0.35 * Math.sin(t)) + 5 * wobble(this.time, 8, 0, 2);
    this.y = this.h * 0.3 + 10 * wobble(this.time, 13.7, 1, 2);
    console.log(this.x, this.y);
    this.vx = Math.cos(t);
    this.vy = 0;
  } else {
    // Falling organ
    this.updateFlight();
  }
};

OrganStage.prototype.updateFlight = function() {
  // Move
  const f = this.timeDif * 0.75;
  this.x += this.vx * f;
  this.y += this.vy * f;
  // Gravity
  this.vy += f * 0.002;
  // Angle according to velocity
  // this.angle = Math.atan2(this.vy, this.vx);
  // Success or no success
  if (this.active && (this.x > this.armLeft - 20 || this.y > this.h + 100)) {
    this.x = this.armLeft - 20;
    this.transitionOut();
  }
};


OrganStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Back of body + inner body
  const bx = this.w * 0.5, by = this.h * 0.65;
  drawImage(ctx, this.bodyBack, bx, by);
  // Organ
  drawImage(ctx, this.organ, this.x, this.y, 0, 1, 1);
  // Hand
  drawImage(ctx, this.hand, this.x, this.y, Math.PI * 0.8, 1, 1, 0.9, 0.4);
  // Front of Body
  drawImage(ctx, this.bodyFront, bx, by - 1);
};
