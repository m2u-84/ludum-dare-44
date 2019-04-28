function GameStage() {
    Stage.call(this, "game", 0);
    this.gameState = null;
    this.lastPatientSpawnTime = 0;
    this.contextStage = null;
    this.floatingTexts = [];
    this.capslockMessageStart = -1;
}

inherit(GameStage, Stage);

GameStage.prototype.preload = function () {
    this.mapImage = loader.loadImage("./assets/map.png");
    Doctor.load();
    Patient.load();
    FacilityManager.load();
    Bed.load();

    this.facitlityManagerDelay = 1000;
};

GameStage.prototype.prestart = function() {
  this.gameState = new GameState();
  this.gameState.init();
  this.lastPatientSpawnTime = 0;
  this.contextStage = null;
};

GameStage.prototype.render = function (ctx, timer) {
    var cellSize = 24;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.imageSmoothingEnabled = false;
    // Handle camera placement
    let camZoom = 1, camTolerance = 0;
    let camX = this.gameState.doctor.x, camY = this.gameState.doctor.y - 1;
    if (this.contextStage) {
      const p = this.contextStage.opacity;
      camZoom = 1; // Interpolators.square(p, camZoom, 4);
      const targetX = (this.gameState.doctor.x + this.contextStage.patient.x) / 2 + 6.4 / camZoom; // 1.6 for camZoom 4
      const targetY = (this.gameState.doctor.y + this.contextStage.patient.y) / 2; // 0.8 for camZoom 4
      camX = Interpolators.cos(p, camX, targetX);
      camY = Interpolators.cos(p, camY, targetY);
      camTolerance = 20 * p;
    }
    ctx.scale(cellSize * camZoom, cellSize * camZoom);
    const minCamX = w / 2 / cellSize / camZoom - camTolerance, minCamY = h / 2 / cellSize / camZoom;
    const maxCamX = (this.mapImage.width - w / 2 / camZoom) / cellSize + camTolerance;
    const maxCamY = (this.mapImage.height - h / 2 / camZoom) / cellSize;
    let offx = clamp(-camX, -maxCamX, -minCamX), offy = clamp(-camY, -maxCamY, -minCamY);
    if (camZoom == 1) {
      offx = Math.round(offx * 24) / 24;
      offy = Math.round(offy * 24) / 24;
    }
    ctx.translate(offx, offy);

    drawImage(ctx, this.mapImage, 0, 0, 0, 1 / cellSize, 1 / cellSize, 0, 0);

    for (let i = 0; i < this.gameState.level.beds.length; i++) {
        this.gameState.level.beds[i].paint(ctx);
    }

    // Draw people sorted by z-index
    let people = [this.gameState.doctor].concat(this.gameState.patients);
    if (this.gameState.facilityManager) {
       people = people.concat([this.gameState.facilityManager]);
    }
    people.sort((a,b) => a.y - b.y);
    people.forEach(p => p.paint(ctx));

    // Draw health bars, also sorted by z-index
    people.forEach(p => { if (p instanceof Patient) { p.paintAttachedUI(ctx); } } );

    // Money
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      if (this.floatingTexts[i].render(ctx)) {
        this.floatingTexts.splice(i, 1);
      }
    }

    ctx.restore();

    // Screen space UI
    this.gameState.hospital.draw(ctx);

    // Capslock message
    if (this.capslockMessageStart > 0) {
      const tdif = this.time - this.capslockMessageStart;
      let p = 0;
      if (tdif < 1000) {
        // Fade in
        p = tdif / 1000;
      } else if (tdif < 7000) {
        p = 1;
      } else if (tdif < 8000) {
        p = 1 - (tdif - 7000) / 1000;
      } else {
        p = 0;
        this.capslockMessageStart = -1;
      }
      if (p > 0) {
        ctx.globalAlpha = p;
        const y = -10 + 18 * Interpolators.cos(p);
        mainFont.drawText(ctx, "Activated Capslock may interfere with the game!", w / 2, y, "red", 0.5);
      }
    }
};

GameStage.prototype.update = function (timer) {
    if (this.timeDif === 0) {
        return;
    }
    this.gameState.doctor.update();
    const closestPatientInfo = this.gameState.doctor.getClosestIdlePatient();
    if (closestPatientInfo.distance < 1.2) {
        this.gameState.closestPatientToDoctor = closestPatientInfo.patient;
    } else {
        this.gameState.closestPatientToDoctor = null;
    }

    this.gameState.patients.forEach(p => p.update());
    if (this.gameState.facilityManager) {
        this.gameState.facilityManager.update();
    }
    this.gameState.hospital.update(this.timeDif, this.time);

    if ((this.gameState.facilityManager === null) && (this.time > this.facitlityManagerDelay)) {
        this.gameState.facilityManager = this.spawnFacilityManager();
    }

    const currentTime = this.time;
    if (currentTime - this.lastPatientSpawnTime > 3000) {
        this.lastPatientSpawnTime = currentTime;
        this.spawnPatient();
    }
};

GameStage.prototype.spawnPatient = function () {
    const spawnPoint = this.getRandomElement(this.gameState.level.spawnPoints);
    if (spawnPoint !== null) {

        const health = rndInt(25, 100),
              wealth = rndInt(15, 100),
              sickness = this.gameState.sicknesses[0];
        const patient = new Patient(spawnPoint.x, spawnPoint.y, health, wealth, sickness, this.gameState);
        if (patient.executeAction("Register")) {
          this.gameState.patients.push(patient);
        } // TODO: possibly try to respawn patient earlier if reception slot is blocked
    }
};

GameStage.prototype.spawnFacilityManager = function () {
    const spawnPoint = this.getRandomElement(this.gameState.level.spawnPoints);
    if (spawnPoint !== null) {

        const facilityManager = new FacilityManager(spawnPoint.x, spawnPoint.y, this.gameState);
        facilityManager.nextState();

        return facilityManager;
    }
};

GameStage.prototype.showFloatingText = function(t, x, y, color) {
  this.floatingTexts.push(
    new FloatingText(t, x, y, color)
  );
};

GameStage.prototype.getRandomElement = function(list) {

    if (list.length > 0) {
        return list[Math.floor(Math.random() * list.length)]
    }
    return null;
};

GameStage.prototype.onkey = function (event) {
    if (event && event.key && event.key.length == 1 && (event.key !== event.key.toLowerCase() || isSpecialCharacter(event.key))
        && !event.shiftKey && this.capslockMessageStart < 0) {
        console.log(event);
      this.capslockMessageStart = this.time;
    }
    if (event.key === "Escape") {
        // TODO this.transitionIn("pause", 400);
    } else if (event.key === "Enter") {
        this.transitionIn(getRandomItem(["organ", "syringe"]));
    } else if (event.key === "Shift") {
        if (this.gameState.closestPatientToDoctor !== null) {
            this.contextStage = this.transitionIn("context", 300, { patient: this.gameState.closestPatientToDoctor });
        }
    }
};

function isSpecialCharacter(char) {
  return ["!", "*", "§", "$", "%", "&", "@", "(", ")", "?"].indexOf(char) >= 0;
}