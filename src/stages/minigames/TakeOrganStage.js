
function TakeOrganStage() {
  MinigameStage.call(this, "takeOrgan");
  this.takeDuration = 1200;
  this.failDuration = 800;
}
inherit(TakeOrganStage, MinigameStage);

TakeOrganStage.prototype.preload = function() {
  MinigameStage.prototype.preload.call(this);
  this.organ = loader.loadImage("assets/images/organ.png");
  this.hookImage = loader.loadImage("assets/images/grabmachine.png", 2, 1);
  this.openHand = loader.loadImage("assets/images/organ_hand_back_open.png");
  this.bodyBack = loader.loadImage("assets/images/organ_body_back.png");
  this.bodyFront = loader.loadImage("assets/images/organ_body_front.png");
};

TakeOrganStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.takeOrgan;
  this.isTaking = false;
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.wellPlaced = false;
  this.sessionStart = this.time;
  this.sessionOffset = (rnd() < 0.5) ? Math.PI : 0;
  this.takeProgress = 0;
  this.takeStart = 0;
  this.duration = 0;
};

TakeOrganStage.prototype.stop = function() {
  MinigameStage.prototype.stop.call(this);
  if (this.success) {
    gameStage.gameState.hospital.giveOrgan();
    this.patient.hasOrgan = false;
  }
};

TakeOrganStage.prototype.update = function(timer) {
  if (this.paused) { return; }
  MinigameStage.prototype.update.call(this, timer);
  if (!this.isTaking) {
    // Hand movement
    const speed = 2.5;
    const t = (this.time - this.sessionStart + this.sessionOffset) * 0.001 * speed;
    this.x = this.w * (0.5 + 0.35 * Math.sin(t)) + 8 * wobble(this.time, 10, 0, 2);
    this.y = this.h * 0.2 + 10 * wobble(this.time, 13.7, 1, 2);
    this.handX = this.x;
    this.handY = this.y;
    if (this.getKeyState(" ")) {
      // Take it
      this.wellPlaced = (Math.abs(this.handX - this.w * 0.46) < this.w * 0.15);
      this.isTaking = true;
      this.takeHeight = this.h * (this.wellPlaced ? 0.85 : 0.4);
      this.takeStart = this.time;
      this.duration = (this.wellPlaced ? this.takeDuration : this.failDuration);
    }
  } else {
    // Falling organ
    this.updateTake();
  }
};

TakeOrganStage.prototype.updateTake = function() {
  // Move
  const tdif = this.time - this.takeStart;
  let p = this.takeProgress = tdif / this.duration;
  if (p >= 1.5) {
    this.close(this.wellPlaced);
  }
  if (p >= 1) {
    p = this.takeProgress = 1;
  }
  if (this.wellPlaced) {
    const correction = Math.sin(Math.PI * p);
    this.handX = correction * (this.w * 0.45) + (1 - correction) * this.x;
  }
  this.handY = this.y + this.takeHeight * Math.sin(Math.PI * p);
};


TakeOrganStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Back of body + inner body
  const bx = this.w * 0.5, by = Math.round(this.h * 0.65);
  drawImageToScreen(ctx, this.bodyBack, bx, by);
  // Organ
  if (this.takeProgress > 0.5 && this.wellPlaced) {
    drawImageToScreen(ctx, this.organ, Math.round(this.handX), Math.round(this.handY) + 60, 0, 1, 1);
  }
  // Hook
  const frame = (this.takeProgress > 0.5 && this.wellPlaced) ? 1 : 0;
  drawFrame(ctx, this.hookImage, frame, Math.round(this.handX), Math.round(this.handY), 0, 1, 1, 0.5, 0.9);
  // Front of Body
  drawImageToScreen(ctx, this.bodyFront, bx, by - 1);
  // MinigameStage handles overlay stuff / UI
  MinigameStage.prototype.renderOnTop.call(this, ctx, timer);
};
