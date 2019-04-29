
function PlaceboStage() {
  MinigameStage.call(this, "placebo");
  this.helpText = "WASD to move paddle. Don't hit the patient.";
  this.paddleW = 50;
  this.paddleW2 = this.paddleW / 2;
  this.ballSize = 14;
  this.ballR = this.ballSize / 2;
  this.minBallSpeed = 0.1;
  this.maxBallSpeed = 0.5;
  this.dampingX = 0.9984;
  this.dampingY = 0.997;
  this.strength = 0.25;
  this.bounces = 0;
  this.maxBounces = 0;
}
inherit(PlaceboStage, MinigameStage);

PlaceboStage.prototype.preload = function() {
  MinigameStage.prototype.preload.call(this);

  const ASSETS_BASE_PATH = './assets/';
  const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
  const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

  this.patientImage = loader.loadImage(IMAGES_BASE_PATH + 'patient_head.png');
  this.paddleImage = loader.loadImage(IMAGES_BASE_PATH + 'tabletennis_hand.png');
  this.ballImage = loader.loadImage(IMAGES_BASE_PATH + 'tabletennis_ball.png');

  this.soundsBounce = [
    loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/pingpong-volley/pingpong-volley-1.mp3'}),
    loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/pingpong-volley/pingpong-volley-2.mp3'}),
    loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/pingpong-volley/pingpong-volley-3.mp3'})
  ];
};

PlaceboStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.placeboSurgery; // define the minigame's treatment here
  // Reset minigame logics here
  this.bounces = 0;
  this.paddleBaseX = 130;
  this.paddleBaseY = 160;
  this.controlledPaddleX = 0;
  this.controlledPaddleY = 0;
  this.paddleX = this.paddleBaseX;
  this.paddleY = this.paddleBaseY;
  this.paddleAngle = 0;
  this.controlledPaddleAngle = 0;
  this.ballX = this.paddleBaseX;
  this.ballY = this.paddleBaseY - 20;
  this.ballVX = 0.04 * (rnd(1) - rnd(1));
  this.ballVY = -0.35;
  this.paddleVX = 0;
  this.paddleVY = 0;
  this.markX = 0;
  this.markY = 0;
};

PlaceboStage.prototype.update = function(timer) {
  if (this.paused) { return; }
  MinigameStage.prototype.update.call(this, timer);
  // Paddle Controls
  const rl = ((this.getKeyState("d") || this.getKeyState("ArrowRight")) ? 1 : 0) -
      ((this.getKeyState("a") || this.getKeyState("ArrowLeft")) ? 1 : 0);
  const ud = ((this.getKeyState("s") || this.getKeyState("ArrowDown")) ? 1 : 0) -
      ((this.getKeyState("w") || this.getKeyState("ArrowUp")) ? 1 : 0);
  this.controlledPaddleX += this.timeDif * rl * this.strength;
  this.controlledPaddleY += this.timeDif * ud * this.strength;
  this.controlledPaddleY = Math.max(this.controlledPaddleY, -18);
  // Force to center
  this.controlledPaddleX *= Math.pow(this.dampingX, this.timeDif);
  this.controlledPaddleY *= Math.pow(this.dampingY, this.timeDif);
  // Update
  const lastPX = this.paddleX, lastPY = this.paddleY;
  this.paddleX = this.paddleBaseX + this.controlledPaddleX + 6 * wobble(this.time, 4.2, 0, 1.2);
  this.paddleY = this.paddleBaseY + this.controlledPaddleY + 4 * wobble(this.time, 7.2, 0, 1.8);
  this.paddleVX = (this.paddleX - lastPX) / this.timeDif;
  this.paddleVY = (this.paddleY - lastPY) / this.timeDif;
  this.paddleAngle = this.controlledPaddleAngle + 0.2 * wobble(this.time, 5, 0, 1.5) - this.paddleVX * 0.3;
  // Ball
  const steps = 5;
  const td = this.timeDif / steps;
  for (var i = 0; i < steps; i++) {
    if (this.updateBall(td)) {
      break;
    }
  }
};

PlaceboStage.prototype.updateBall = function(tf) {
  // Gravity
  this.ballVY += 0.0006 * tf;
  // Max Speed
  const spd = Math.sqrt(this.ballVX * this.ballVX + this.ballVY * this.ballVY);
  if (spd > this.maxBallSpeed) {
    this.ballVX *= this.maxBallSpeed / spd;
    this.ballVY *= this.maxBallSpeed / spd;
  }
  // Movement
  this.ballX += this.ballVX * tf;
  this.ballY += this.ballVY * tf;
  // Lose Condition = Patient Collision
  if (this.ballX >= this.w - 110 && this.ballY >= this.h - 80) {
    this.close(false);
    return true;
  }
  // Win condition (leave screen)
  if (this.ballY > this.h + 30) {
    this.close(true);
    return true;
  }
  // Collision with paddle. First check if it's within paddle's bounding box
  if (this.ballX >= this.paddleX - this.paddleW && this.ballX <= this.paddleX + this.paddleW || true) {
    if (this.ballY >= this.paddleY - this.paddleW && this.ballY <= this.paddleY + this.paddleW || true) {
      // Check circle-line-collision
      const pdx = this.paddleW2 * Math.cos(this.paddleAngle), pdy = this.paddleW2 * Math.sin(this.paddleAngle);
      const px1 = this.paddleX - pdx, py1 = this.paddleY - pdy, px2 = this.paddleX + pdx, py2 = this.paddleY + pdy;
      const nearestPoint = getNearestPoint(this.ballX, this.ballY, px1, py1, px2, py2);
      const dis = nearestPoint.distance;
      if (dis <= this.ballR) {
        this.soundsBounce[rndInt(0, 2)].play();

        // Reflect away from collision point
        const dx = nearestPoint.x - this.ballX, dy = nearestPoint.y - this.ballY;
        const vel = reflectVelocity(this.ballVX, this.ballVY, dx, dy);
        this.ballVX = vel.x;
        this.ballVY = vel.y;
        // Add paddle movement
        this.ballVX -= 0.2 * this.paddleVX;
        this.ballVY += this.paddleVY;
        // Ensure minimal speed of ball
        const spd = Math.sqrt(this.ballVX * this.ballVX + this.ballVY * this.ballVY);
        if (spd == 0) {
          // Hack in weird edge case that's never going to happen
          this.ballVY = -0.3;
        } else {
          // Speed too low -> scale up
          if (spd < this.minBallSpeed) {
            this.ballVX *= this.minBallSpeed / spd;
            this.ballVY *= this.minBallSpeed / spd;
          }
        }
        // Move away
        this.ballX += 2 * this.ballVX * tf;
        this.ballY += 2 * this.ballVY * tf;
        // Bounces
        this.bounces++;
        this.maxBounces = Math.max(this.bounces, this.maxBounces);
        this.patient.gameState.stats.pingPongBounces = Math.max(this.patient.gameState.stats.pingPongBounces, this.maxBounces);
      }
    }
  }
};

PlaceboStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Patient
  drawImageToScreen(ctx, this.patientImage, this.w, this.h, 0, 1, 1, 1, 1);
  // Paddle
  drawImageToScreen(ctx, this.paddleImage, this.paddleX, this.paddleY, this.paddleAngle, 1, 1, 0.43, 0.06);
  ctx.fillRect(this.markX-1, this.markY-1, 2, 2);
  // Ball
  drawImageToScreen(ctx, this.ballImage, this.ballX, this.ballY, 0, 1, 1, 0.5, 0.5);
  // Ball position
  ctx.fillStyle = "#ffffff60";
  ctx.fillRect(this.ballX - 2, this.h - 5, 3, 3);
  // MinigameStage handles overlay stuff / UI
  MinigameStage.prototype.renderOnTop.call(this, ctx, timer);
};

function getNearestPoint(x, y, x1, y1, x2, y2) {
  // there are much faster methods but my brain is much so I'm using brute force don't judge me
  const steps = 64;
  const dx = x2 - x1, dy = y2 - y1;
  let shortestDistance = Infinity, bestPoint = {x: x1, y: y1}
  for (var s = 0; s <= steps; s++) {
    const p = s / steps;
    const lx = x1 + p * dx, ly = y1 + p * dy;
    const dis = getDistance2(lx, ly, x, y);
    if (dis < shortestDistance) {
      shortestDistance = dis;
      bestPoint.x = lx;
      bestPoint.y = ly;
    }
  }
  bestPoint.distance = Math.sqrt(shortestDistance);
  return bestPoint;
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(getDistance2(x1, y1, x2, y2));
}

function getDistance2(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  return dx * dx + dy * dy;
}

function reflectVelocity(vx, vy, dx, dy) {
  const colAngle = Math.atan2(dx, dy);
  const sin = Math.sin(colAngle), cos = Math.cos(colAngle);
  // First, rotate velocity by that angle
  let nvx = cos * vx - sin * vy;
  let nvy = sin * vx + cos * vy;
  // Second, absolutize y movement and apply minor damping
  nvy = -0.95 * Math.abs(nvy);
  // Third, rotate back
  const result = {
    x: cos * nvx + sin * nvy,
    y: -sin * nvx + cos * nvy
  };
  return result;
}
