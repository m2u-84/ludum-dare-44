
function ContextMenuStage() {
  this.patient = null;
  this.actions = [];
  Stage.call(this, "context", 5);
}
inherit(ContextMenuStage, Stage);

ContextMenuStage.prototype.preload = function() {
  this.background = loader.loadImage("assets/images/patientsheet.png");
  this.keyImage = loader.loadImage("assets/images/keys.png", 9, 1);
};

ContextMenuStage.prototype.prestart = function(payload) {
  this.patient = payload.patient;
  this.actions = this.patient ? this.patient.getActions() : [];
};

ContextMenuStage.prototype.update = function(timer) {
  if (this.actions.length < 1) {
    this.close();
  }
};

ContextMenuStage.prototype.render = function(ctx, timer) {
  const self = this;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic(this.opacity);
  // Black background
  ctx.globalAlpha = p * 0.3;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  // Background
  ctx.globalAlpha = 1;
  const y = (h - this.background.height) / 2;
  const x = w - this.background.width * p;
  ctx.translate(x, y);
  drawImageToScreen(ctx, this.background, 0, 0, 0, 1, 1, 0, 0);
  // Draw Patient Overview
  ctx.translate(14, 14);
  bigFont.drawText(ctx, "" + this.patient.id, 118, 0, "dark");
  ctx.globalAlpha = 0.2;
  const wealth = this.patient.wealthLevel == 1 ? "$" : this.patient.wealthLevel == 2 ? "$$" : "$$$";
  mainFont.drawText(ctx, "$$$", 0, 34, "green");
  ctx.globalAlpha = 1;
  mainFont.drawText(ctx, wealth, 0, 34, "green");
  const diagnosis = this.patient.diagnosed ? this.patient.sickness.name : "???";
  mainFont.drawText(ctx, diagnosis, 80, 34, "orange");

  // Preferred option
  drawOption(72, 1, this.actions[0], "Safe");
  for (var i = 1; i < this.actions.length; i++) {
    const action = this.actions[i];
    const y = 107 + 18 * i;
    drawOption(y, i + 1, action, "Safe");
    ctx.fillStyle = "#00000020";
    ctx.fillRect(20, y + 12, 240, 1);
  }

  function drawOption(y, num, nameOrTreatment) {
    if (nameOrTreatment instanceof Treatment) {
      if (!nameOrTreatment.isEnabled(self.patient)) {
        ctx.globalAlpha = 0.2;
      }
    }
    // Key symbol
    drawFrame(ctx, self.keyImage, num - 1, 0, y - 4, 0, 1, 1, 0, 0);
    // Option name
    const name = nameOrTreatment instanceof Treatment ? nameOrTreatment.name : nameOrTreatment;
    mainFont.drawText(ctx, name, 20, y, "blue");
    // Safety
    if (self.patient.diagnosed && nameOrTreatment instanceof Treatment) {
      const safetyLevel = nameOrTreatment.getBaseSafetyFor(self.patient.sickness);
      const safety = getSafetyStyle(safetyLevel);
      mainFont.drawText(ctx, safety.text, 140, y, safety.color);
    }
    // Price
    let price = null;
    if (nameOrTreatment instanceof Treatment) {
      price = self.patient.getTreatmentPrice(nameOrTreatment);
    }
    if (price != null) {
      const priceColor = price == 0 ? "gray" : price > 0 ? "green" : "red";
      const priceString = (price >= 0 ? "+ $ " : "- $ ") + Math.abs(price);
      mainFont.drawText(ctx, priceString, 260, y, priceColor, 1);
    }
    ctx.globalAlpha = 1;
  }

  function getSafetyStyle(v) {
    const styles = [
      {max: 0.2, text: "dangerous", color: "red"},
      {max: 0.45, text: "unsafe", color: "orange"},
      {max: 0.6, text: "moderate", color: "yellow"},
      {max: 0.8, text: "safe", color: "green"},
      {max: 1, text: "ideal", color: "blue"},
    ];
    for (var i = 0; i < styles.length; i++) {
      if (styles[i].max >= v) {
        return styles[i];
      }
    }
    return {max: 0, text: "unknown", color: "gray"};
  }
};


ContextMenuStage.prototype.onkey = function(event) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].indexOf(event.key) >= 0) {
    // Prevent accidental closing when opening menu while still barely running
    if (this.opacity >= 0.95 && this.time > 200) {
      this.close();
    }
  } else if (event.key == "Escape") {
    if (this.active) {
      this.transitionIn("pause", 800);
    }
  } else {
    const num = event.key - 1;
    if (num >= 0 && num < this.actions.length) {
      if (this.actions[num] instanceof Treatment && !this.actions[num].isEnabled(this.patient)) {
        return;
      }
      this.close();
      this.patient.executeAction(this.actions[num]);
    }
  }
};

ContextMenuStage.prototype.close = function() {
  if (this.active) {
    this.transitionOut(300);
  }
};
