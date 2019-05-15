
function SurgeryStage() {
  MinigameStage.call(this, "surgery");
  this.helpText = "Hold space to cut at the mark with the scalpel";
  this.evaluationDelay = 520;
}
inherit(SurgeryStage, MinigameStage);

SurgeryStage.prototype.preload = function() {
  MinigameStage.prototype.preload.call(this);
  // load graphics here
  this.scalpelImage = loader.loadImage("assets/images/scalpel.png", 1, 2);
  this.bodyImage = loader.loadImage("assets/images/surgery_body.png");
  this.holeImage = loader.loadImage("assets/images/surgery_cut.png");
  this.handImage = loader.loadImage("assets/images/darthand_back.png");
  this.thumbImage = loader.loadImage("assets/images/darthand_front.png");
  this.bloodSplatImage = loader.loadImage("assets/images/bloodsplat.png", 1, 4);
};

SurgeryStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.surgery; // TODO add that treatment
  // Reset minigame logics here
  this.targetFrom = 208 / 500;
  this.targetTo = 266 / 500;
  this.targetMid = (this.targetFrom + this.targetTo) / 2;
  this.targetSpan = this.targetTo - this.targetFrom;
  this.targetHeight = 0.15;
  this.stopHeight = 0.17;
  this.maxHeight = 0.32;
  this.cutStart = 0;
  this.cutEnd = 0;
  this.cutStarted = false;
  this.cutEnded = false;
  this.evaluationTime = null;
  this.lastX = 0;
  this.x = 0;
  this.y = 0;
  this.yoff = 0;
  this.vy = 0;
  this.scalpelFrame = 0;
  this.bloodSplatFrame = 0;
};

SurgeryStage.prototype.update = function(timer) {
  MinigameStage.prototype.update.call(this, timer);
  if (this.paused || this.timeDif <= 0) { return; }
  // Self update
  // Base position
  this.scalpelAngle = 0 * 0.2 * wobble(this.time, 8.7, 0.4);
  this.lastX = this.x;
  this.x = this.w * (this.targetMid + 1.5 * this.targetSpan * Math.sin(this.time * 0.0012)) + 10 * wobble(this.time, 3.7, 2.5);
  this.baseY = this.h * 0.2 + 16 * wobble(this.time, 14, 0);
  // Falling
  this.yoff += this.timeDif * this.vy;
  if (this.getKeyState(" ") && !this.cutEnded) {
    this.vy += this.timeDif * 0.004;
    if (this.yoff > this.stopHeight * this.h) {
      this.vy *= Math.pow(0.95, this.timeDif);
      if (this.yoff > this.maxHeight * this.h) {
        this.yoff = this.maxHeight * this.h;
        this.vy = 0;
      }
    }
  } else {
    this.vy -= this.timeDif * 0.004;
    if (this.yoff < 0) {
      this.yoff = 0;
      this.vy = 0;
    }
  }
  this.y = this.baseY + this.yoff;
  // Scalpel end
  this.scalpelX = this.x - 80 * Math.sin(this.scalpelAngle);
  this.scalpelY = this.y + 80 * Math.cos(this.scalpelAngle);
  // Cutting
  if (!this.cutEnded) {
    if (!this.cutStarted) {
      if (this.yoff > this.stopHeight * this.h) {
        // Start to cut
        this.cutStarted = true;
        this.cutStartTime = this.time;
        this.cutStart = this.x;
        this.cutEnd = this.x;
      }
    } else {
      if (this.yoff > this.stopHeight * this.h) {
        // Cutting process
        if ((this.time - this.cutStartTime) > 400) this.bloodSplatFrame = 2;
        else if ((this.time - this.cutStartTime) > 200) this.bloodSplatFrame = 1;
        this.cutStart = Math.min(this.cutStart, this.x - 1);
        this.cutEnd = Math.max(this.cutEnd, this.x + 1);
      } else {
        // End cut
        this.bloodSplatFrame = 3;
        this.cutEnded = true;
        this.scalpelFrame = 1;
        this.evaluationTime = this.time + this.evaluationDelay;
      }
    }
  } else {
    // Cut ended and scalpel back at top -> evaluate
    if (this.evaluationTime != null) {
      if (this.time > this.evaluationTime) {
        const success = this.evaluate();
        this.close(success);
      }
    }
  }
};

SurgeryStage.prototype.evaluate = function() {
  const span = (this.cutEnd - this.cutStart) / this.w;
  const mid = this.cutStart / this.w + span / 2;
  const rightSize = isWithinRange(span, this.targetSpan * 0.6, 1.6 * this.targetSpan),
      rightPosition = isWithinRange(mid, this.targetMid - 0.4 * this.targetSpan, this.targetMid + 0.4 * this.targetSpan);
  return rightSize && rightPosition;
};

SurgeryStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Body
  drawImageToScreen(ctx, this.bodyImage, this.w / 2, this.h, 0, 1, 1, 0.5, 0.8);
  // Hole
  const holeHeight = this.h * (0.62 + this.targetHeight);
  if (this.cutStarted) {
    const holeScale = (this.cutEnd - this.cutStart) / this.holeImage.width;
    const holeScaleY = holeScale > 2 ? 1 : holeScale - 0.25 * Math.pow(holeScale, 2);
    drawFrame(ctx, this.bloodSplatImage, this.bloodSplatFrame, 145, Math.floor(holeHeight) + 3, 0, 1, 1, 0, 0.5);
    drawImageToScreen(ctx, this.holeImage, this.cutStart, Math.floor(holeHeight), 0, holeScale, holeScaleY, 0, 0.5);
  }
  // Hand with scalpel
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, this.w, holeHeight);
  ctx.clip();
  drawImageToScreen(ctx, this.handImage, this.x, this.y, Math.PI / 2, 1, 1, 0.9, 0.1);
  const mirror = (this.x < this.lastX) ? 1 : -1;
  drawFrame(ctx, this.scalpelImage, this.scalpelFrame, this.x, this.y, Math.PI / 2 + this.scalpelAngle, 1, 1 * mirror, 0.2, 0.5);
  drawImageToScreen(ctx, this.thumbImage, this.x, this.y, Math.PI / 2, 1, 1, 0.9, 0.1);
  ctx.restore();
  const h = 180;
  /* this.renderPosition(ctx, this.targetFrom * this.w, h);
  this.renderPosition(ctx, this.targetTo * this.w, h);
  this.renderPosition(ctx, this.cutStart, h + 5);
  this.renderPosition(ctx, this.cutEnd, h + 5);
  this.renderPosition(ctx, this.scalpelX, this.scalpelY); */
  // MinigameStage handles overlay stuff / UI
  MinigameStage.prototype.renderOnTop.call(this, ctx, timer);
};
