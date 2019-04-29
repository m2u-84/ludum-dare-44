
function DrugStage() {
  MinigameStage.call(this, "drug");
  this.tableLeft = 10;
  this.tableRight = 260;
  this.tableTop = 220;
  this.tableTopPill = this.tableTop - 12;
  this.grabDuration = 1200;
}
inherit(DrugStage, MinigameStage);

DrugStage.prototype.preload = function() {
  MinigameStage.prototype.preload.call(this);
  // load graphics here
  this.headImage = loader.loadImage("assets/images/pill_head.png");
  this.pillImage = loader.loadImage("assets/images/pill.png");
  this.handImage = loader.loadImage("assets/images/darthand_back.png");
  this.thumbImage = loader.loadImage("assets/images/darthand_front.png");
};

DrugStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.drugs;
  // Reset minigame logics here
  this.tries = 0;
  this.flying = false;
  this.lying = false;
  this.handX = 50;
  this.handY = 50;
  this.wellPlaced = false;
  this.x = this.handX;
  this.y = this.handY;
  this.vx = 0;
  this.vy = 0;
  this.angle = -Math.PI / 4;
  this.throwFromX = 0;
  this.grabStart = 0;
};

DrugStage.prototype.update = function(timer) {
  this.target = {
    x: this.w - 114,
    y: this.h - 70,
    r: 30
  };
  this.bounceArea = {
    x: this.w - 42,
    y: this.h - 6,
    r: 125
  }
  this.clipRect = [ 0, 0, 0.9 * this.w, 0.8 * this.h ];
  if (this.paused) { return; }
  MinigameStage.prototype.update.call(this, timer);
  this.updateWobble();
  if (!this.flying && !this.lying) {
    this.updateWobblyHand();
  } else if (this.flying) {
    this.updatePill();
  } else if (this.lying) {
    this.updateGrab();
  }
};

DrugStage.prototype.updateWobble = function() {
  // Mighty Wobble
  const speed = 5.5;
  const cur = wobbleToPos(wobble(this.time, speed, 0, 1, 0.5)*0.5 + 0.5*Math.sin(this.time*0.001*speed));
  const prev = wobbleToPos(wobble(this.time-0.1, speed, 0, 1, 0.5)*0.5 + 0.5*Math.sin((this.time-0.1)*0.001*speed));
  // this.handX = this.w * 0.3 + 80 * wobble(this.time, 12, 0, 1);
  // this.handY = this.h * 0.3 + 60 * wobble(this.time, 9, 1.7, 1.4);
  this.wobbles = [cur, prev];

  function wobbleToPos(v) {
    const x = 90 + 70 * Math.sin(v);
    const y = 90 - 60 * Math.sin(v);
    return {x, y};
  }
};

DrugStage.prototype.updateWobblyHand = function() {
  const cur = this.wobbles[0], prev = this.wobbles[1];
  this.handX = cur.x;
  this.handY = cur.y;
  this.vx = (cur.x - prev.x) * 14;
  this.vy = (cur.y - prev.y) * 14;
  // Place Pill in hand
  this.x = this.handX;
  this.y = this.handY;
  // Throw
  if (this.getKeyState(" ")) {
    this.flying = true;
    this.throwFromX = this.x;
  }
};

DrugStage.prototype.updatePill = function() {
  // Gravity
  this.vy += 0.001 * this.timeDif;
  // Fly
  this.x += this.vx * this.timeDif;
  this.y += this.vy * this.timeDif;
  // Angle
  const p_angle = (this.x - this.throwFromX) / (this.target.x - this.throwFromX);
  this.angle = (-Math.PI / 4) - (Math.PI / 2) * p_angle;
  // Lying on Table?
  if (this.x >= this.tableLeft && this.x <= this.tableRight && this.y >= this.tableTopPill) {
    this.y = this.tableTopPill;
    this.flying = false;
    this.lying = true;
    this.angle = 0;
    this.grabStart = this.time;
    this.handBaseX = this.handX;
    this.handBaseY = this.handY;
    this.pillBaseX = this.x;
    this.pillBaseY = this.y;
  } else if (this.x < -200 || this.x > this.w + 200 || this.y > this.h + 80) {
    if (this.wellPlaced) {
      this.close(true);
      return;
    }
    // out of bounds
    this.close(false);
    return;
  } else {
    // Check collision with mouth
    if (getDistance(this.x, this.y, this.target.x, this.target.y) <= this.target.r) {
      this.wellPlaced = true;
    }
    // Check collision with head
    if (!this.wellPlaced) {
      if (getDistance(this.x, this.y, this.bounceArea.x, this.bounceArea.y) <= this.bounceArea.r) {
        // bounce back
        const vel = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const dx = this.w * 0.92 - this.x, dy = this.h - this.y;
        const angle = Math.atan2(dx, dy);
        this.vx = -0.8 * vel * Math.sin(angle);
        this.vy = -0.8 * vel * Math.cos(angle);
        this.x += this.vx * this.timeDif;
        this.y += this.vy * this.timeDif;
      }
    }
  }
};

DrugStage.prototype.updateGrab = function() {
  const t = (this.time - this.grabStart) / this.grabDuration;
  if (t >= 0.15) {
    let p = (t - 0.15) / (0.85);
    if (p > 1) { p = 1; }
    const f = 0.5 - 0.5 * Math.cos(2 * Math.PI * p);
    const f1 = 1 - f;
    const baseX = (p < 0.5) ? this.handBaseX : this.wobbles[0].x, baseY = (p < 0.5) ? this.handBaseY : this.wobbles[0].y;
    this.handX = f * this.pillBaseX + f1 * baseX;
    this.handY = f * this.pillBaseY + f1 * baseY;
    if (p >= 0.5) {
      this.x = this.handX;
      this.y = this.handY;
      this.angle = -Math.pow((p - 0.5) * 2, 0.5) * Math.PI / 4;
    }
    if (p >= 1) {
      this.lying = false;
    }
  }
};

DrugStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Table
  ctx.fillStyle = "#784823";
  ctx.fillRect(this.tableLeft, this.tableTop, this.tableRight - this.tableLeft, 30);
  // Hand
  drawImageToScreen(ctx, this.handImage, this.handX, this.handY, Math.PI / 2, 1, 1, 0.85, 0.12);
  // Pill
  ctx.save();
  if (this.wellPlaced) {
    ctx.beginPath();
    ctx.rect(this.clipRect[0], this.clipRect[1], this.clipRect[2], this.clipRect[3]);
    ctx.clip();
  }
  drawImageToScreen(ctx, this.pillImage, this.x, this.y, this.angle, 1, 1, 0.5, 0.5);
  ctx.restore();
  // Thumb
  drawImageToScreen(ctx, this.thumbImage, this.handX, this.handY, Math.PI / 2, 1, 1, 0.85, 0.12);
  // win area
  /*
  ctx.fillStyle = "gray";
  ctx.beginPath();
  ctx.moveTo(this.w - 30, this.h);
  ctx.arc(this.w - 42, this.h - 6, 115, 0, 6.28);
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(this.w - 130, this.h - 80);
  ctx.arc(this.w - 114, this.h - 70, 32, 0, 6.28);
  ctx.fill(); */
  // Patient
  drawImageToScreen(ctx, this.headImage, this.w, this.h, 0, 1, 1, 1, 1);
  // MinigameStage handles overlay stuff / UI
  MinigameStage.prototype.renderOnTop.call(this, ctx, timer);
};
