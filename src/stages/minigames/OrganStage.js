
function OrganStage() {
  MinigameStage.call(this, "organ");
  this.helpText = "Press Space to throw organ into opening";
}
inherit(OrganStage, MinigameStage);

OrganStage.prototype.preload = function() {
  MinigameStage.prototype.preload.call(this);

  const ASSETS_BASE_PATH = './assets/';
  const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
  const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

  this.organ = loader.loadImage(IMAGES_BASE_PATH + 'organ.png');
  this.hand = loader.loadImage(IMAGES_BASE_PATH + 'organ_hand_back.png');
  this.thumb = loader.loadImage(IMAGES_BASE_PATH + 'organ_hand_front.png');
  this.dropHand = loader.loadImage(IMAGES_BASE_PATH + 'organ_hand_back_open.png');
  this.bodyBack = loader.loadImage(IMAGES_BASE_PATH + 'organ_body_back.png');
  this.bodyFront = loader.loadImage(IMAGES_BASE_PATH + 'organ_body_front.png');

  this.soundsBounce = [
    loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/organ-bounce/organ-bounce-1.mp3'}),
    loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/organ-bounce/organ-bounce-2.mp3'}),
    loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/organ-bounce/organ-bounce-3.mp3'})
  ];
};

OrganStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.organ;
  this.isFlying = false;
  this.vx = 0;
  this.vy = 0;
  this.bounces = 2;
  this.angleRotationStart = 0;
  this.angleSpeed = 0;
  this.startAngle = 0;
  this.x = 0;
  this.y = 0;
  this.bounceHeight = 0;
  this.angle = 0;
  this.organWellPlaced = false;
  this.firstBounceTime = 0;
  this.sessionStart = this.time;
  this.sessionOffset = (rnd() < 0.5) ? Math.PI : 0;
};

OrganStage.prototype.prestop = function() {
  gameStage.gameState.hospital.takeOrgan();
};

OrganStage.prototype.update = function(timer) {
  if (this.paused) { return; }
  MinigameStage.prototype.update.call(this, timer);
  if (this.bounceHeight == 0) this.bounceHeight = this.h * 0.7;
  if (!this.isFlying) {
    const speed = 2.5;
    const t = (this.time - this.sessionStart) * 0.001 * speed  + this.sessionOffset;
    this.x = this.w * (0.5 + 0.35 * Math.sin(t)) + 8 * wobble(this.time, 10, 0, 2);
    this.y = this.h * 0.2 + 10 * wobble(this.time, 13.7, 1, 2);
    this.handX = this.x;
    this.handY = this.y;
    this.vx = Math.cos(t) * 0.2 * speed;
    this.vy = 0;
    this.angleRotationStart = this.time;
    this.angleSpeed = this.vx * 0.01;
    if (this.getKeyState(" ")) {
      // Start flight
      this.isFlying = true;
    }
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
  if (this.y < this.h - 50) {
    this.organWellPlaced = this.isFlying && this.y > 0.3 * this.h && (this.x >= 0.4 * this.w && this.x <= 0.6 * this.w);
  }
  // Gravity
  this.vy += f * 0.002;
  // Angle
  this.angle = this.startAngle + this.angleSpeed * (this.time - this.angleRotationStart);
  // Bounce
  if (this.y > this.bounceHeight) {
    this.soundsBounce[rndInt(0, 3)].play();

    if (this.organWellPlaced) {
      this.vx = 0;
    } else {
      // Bounce back
      this.y = this.bounceHeight;
      const dx = Math.abs(this.x - this.w / 2) - (this.w * 0.05);
      const angle = -Math.PI / 4 + (Math.PI / 2) * dx / (this.w / 2);
      const v = 0.7 * Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.vx = v * Math.sin(angle);
      this.vy = -v * Math.cos(angle);
      if (this.x < this.w / 2) { this.vx = -this.vx; }
      this.angleRotationStart = this.time;
      this.angleSpeed = this.vx * 0.015;
      this.startAngle = this.angle;
      if (this.bounces == 2) {
        this.firstBounceTime = this.time;
      }
      this.bounces--;
      if (this.bounces <= 0) {
        this.bounceHeight = this.h + 1000;
      }
    }
  }
  // Success or no success
  if (this.active && (this.y > this.h + 100 || this.x < -90 || this.x > this.w + 90)) {
    this.close(this.organWellPlaced);
  }
};


OrganStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Back of body + inner body
  const bx = this.w * 0.5, by = Math.round(this.h * 0.65);
  drawImage(ctx, this.bodyBack, bx, by);
  // Organ
  let scaleX = 1;
  if (this.bounces < 2) {
    scaleX = 1 + 0.2 * Math.sin((this.time - this.firstBounceTime) * 0.01);
  }
  if (this.organWellPlaced) drawImage(ctx, this.organ, this.x, this.y, this.angle, scaleX, 1/scaleX);
  // Hand
  if (!this.isFlying) {
    drawImage(ctx, this.hand, this.handX, this.handY, 0, 1, 1, 0.4, 0.7);
  } else {
    drawImage(ctx, this.dropHand, this.handX, this.handY, 0, 1, 1, 0.4, 0.9);
  }
  // Front of Body
  drawImage(ctx, this.bodyFront, bx, by - 1);
  // Organ
  if (!this.organWellPlaced) drawImage(ctx, this.organ, this.x, this.y, this.angle, scaleX, 1/scaleX);
  // Thumb
  drawImage(ctx, this.thumb, this.isFlying ? this.handX - 15 : this.handX, this.handY, this.isFlying ? 0.6 : 0, 1, 1, 0.4, 0.7);
  // MinigameStage handles overlay stuff / UI
  MinigameStage.prototype.renderOnTop.call(this, ctx, timer);
};
