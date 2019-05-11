
function ContextMenuStage() {
  this.patient = null;
  this.actions = [];
  Stage.call(this, "context", 5);
}
inherit(ContextMenuStage, Stage);

ContextMenuStage.prototype.preload = function() {
    this.background = loader.loadAssetImage('patientsheet.png');
    this.postIt = loader.loadAssetImage('postit.png');
    this.dollar = loader.loadAssetImage('dollar.png', 6, 1);
    this.buttonImage = loader.loadAssetImage('treatment_button.png', 1, 10);
    this.dollarAnimation = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4];
    this.keyImage = loader.loadAssetImage('keys.png', 9, 1);
    this.minigameIcons = loader.loadAssetImage('minigames.png', 9, 1);
    this.genderImage = loader.loadAssetImage('gender.png', 3, 1);

    this.hoverSound = loader.loadAssetAudio({src: 'sounds/key-clicking/key-clicking.mp3'});
    this.confirmSound = loader.loadAssetAudio({src: 'sounds/key-clicking/confirm.mp3'});
    this.soundSliding = loader.loadAssetAudio({src: 'sounds/paper-sliding/paper-sliding.mp3'});
};

ContextMenuStage.prototype.prestart = function(payload) {
  this.soundSliding.play();
  this.patient = payload.patient;
  this.actions = this.patient ? this.patient.getActions() : [];

  const buttonframes = {
    idle: [0],
    idleSpeed: 75,
    hovered: [1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8],
    hoveredSpeed: 75,
    armed: [9],
    armedSpeed: 75
  }

  this.actionButtons = {};
  this.actions.forEach(action => {
    this.actionButtons[action.name] = new Button(this.buttonImage, buttonframes, function() { stageManager.activeStage.executeButtonAction(action) }, this.confirmSound, this.hoverSound);
  });
};

ContextMenuStage.prototype.update = function(timer) {
  if (this.actions.length < 1) {
    this.close();
  }
};

ContextMenuStage.prototype.executeButtonAction = function(action) {
  this.close();
  this.patient.executeAction(action);
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

  // Draw Wealth Postit
  drawImageToScreen(ctx, this.postIt, -42, 7, 0, 1, 1, 0, 0);
  const frame = getArrayFrame(timer.gameTime / 100, this.dollarAnimation);
  drawFrame(ctx, this.dollar, this.patient.wealthLevel > 0 ? frame : 5, -35, 27, 0, 1, 1, 0, 0);
  drawFrame(ctx, this.dollar, this.patient.wealthLevel > 1 ? frame : 5, -20, 25, 0, 1, 1, 0, 0);
  drawFrame(ctx, this.dollar, this.patient.wealthLevel > 2 ? frame : 5, -5, 30, 0, 1, 1, 0, 0);

  // Draw gender symbol
  drawFrame(ctx, this.genderImage, this.patient.isMale ? 1 : 0, (this.background.width - 30), 10, 0, 1, 1, 0, 0);

  // Draw Patient Overview
  ctx.translate(14, 14);
  // ID
  bigFont.drawText(ctx, "" + this.patient.id, 130, 6, "dark");
  ctx.globalAlpha = 0.2;

  // Diagnosis
  ctx.globalAlpha = 1;
  const diagnosis = this.patient.diagnosed ? (this.patient.cured ? "Cured" : this.patient.sickness.name) : "???";
  mainFont.drawText(ctx, diagnosis, 70, 28, "orange");

  // Preferred option
  drawOption(72, 1, this.actions[0], x+14, y+14);

  for (var i = 1; i < this.actions.length; i++) {
    const action = this.actions[i];
    const posY = 107 + 18 * i;
    drawOption(posY, i + 1, action, x+14, y+14);
    ctx.fillStyle = "rgba(0,0,0,.12)";
    ctx.fillRect(20, posY + 12, 240, 1);
  }

  function drawOption(y, num, nameOrTreatment, translateX, translateY) {
    let isEnabled = true;
    if (nameOrTreatment instanceof Treatment) {
      if (!nameOrTreatment.isEnabled(self.patient)) {
        ctx.globalAlpha = 0.2;
        isEnabled = false;
      }
    }
    // Key symbol
    // drawFrame(ctx, self.keyImage, num - 1, 0, y - 4, 0, 1, 1, 0, 0);

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

    // Draw Action Button
    if (isEnabled)
      self.actionButtons[nameOrTreatment.name].paint(ctx, 0, (y - 5), translateX, translateY)

    // Draw Treatment Icon
    drawFrame(ctx, self.minigameIcons, nameOrTreatment == 'Diagnose' ? 8 : nameOrTreatment.iconIndex, 0, y - 4, 0, 1, 1, 0, 0);
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
  if (["Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].indexOf(event.key) >= 0) {
    // Prevent accidental closing when opening menu while still barely running
    if (this.opacity >= 0.95 && this.time > 200) {
      this.close();
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
    this.soundSliding.play();

    this.transitionOut(300);
  }
};
