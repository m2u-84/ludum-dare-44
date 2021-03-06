function GameStage() {
    Stage.call(this, "game", 0);
    this.gameState = null;
    this.contextStage = null;
    this.floatingTexts = [];
    this.cashflowFeed = new CashflowFeed();
    this.nextPatientSpawnTimeFactor = 1;
}

inherit(GameStage, Stage);

GameStage.load = function() {

    GameStage.audioAmbient = loader.loadAudio({src: "./assets/audio/ambience/ambience.mp3"});
    GameStage.audioMusic = [
        loader.loadAudio({src: "./assets/audio/music/music-1.mp3"}),
        loader.loadAudio({src: "./assets/audio/music/music-2.mp3"})
    ];
};

GameStage.prototype.playAmbientMusic = function() {

    const music = GameStage.audioAmbient;
    music.loop = true;
    music.play();
    music.currentTime = Math.random() * (music.duration || 0);
};

GameStage.prototype.playMusicTrack = function() {

    const music = GameStage.audioMusic[rndInt(0, 2)];
    GameStage.audioMusic.forEach(music => music.stop());
    music.loop = true;
    music.play();
};

GameStage.prototype.preload = function () {
    this.mapImage = loader.loadImage("./assets/images/map.png");
    Doctor.load();
    Patient.load();
    FacilityManager.load();
    Bed.load();
    Hospital.load();
    Car.load();
    PoliceCar.load();
    MafiaCar.load();
    GameStage.load();

    this.facilityManagerDelay = 1000;
};

GameStage.prototype.prestart = function(payload) {
  this.gameState = new GameState();
  this.gameState.init();
  this.contextStage = null;
  // Assign Doctor gender when coming from main menu
  if (payload) this.gameState.doctor.assignGender(payload.isMale);
  this.nextPatientSpawnTime = gameStage.time + 3000;
  this.nextPoliceCarSpawnTime = gameStage.time + 75000;
  this.nextMafiaCarSpawnTime = Infinity;
  this.cashflowFeed.clear();
  this.floatingTexts = [];
};

GameStage.prototype.start = function() {
    // Todo: Enable on release
    this.transitionIn("instructions", 800);
};

GameStage.prototype.render = function (ctx, timer) {
    var cellSize = 24;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.imageSmoothingEnabled = false;
    // Handle camera placement
    let camZoom = 1, camTolerance = 0;
    let camX = this.gameState.doctor.x, camY = this.gameState.doctor.y;
    if (this.contextStage) {
      const p = this.contextStage.opacity;
      camZoom = 1; // Interpolators.square(p, camZoom, 4);
      const targetX = (this.gameState.doctor.x + this.contextStage.patient.x) / 2 + 6.4 / camZoom; // 1.6 for camZoom 4
      const targetY = (this.gameState.doctor.y); // + this.contextStage.patient.y) / 2; // 0.8 for camZoom 4
      camX = Interpolators.cos(p, camX, targetX);
      camY = Interpolators.cos(p, camY, targetY);
      camTolerance = 20 * p;
    }
    ctx.scale(cellSize * camZoom, cellSize * camZoom);
    const minCamX = w / 2 / cellSize / camZoom, minCamY = h / 2 / cellSize / camZoom;
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
    let people = [this.gameState.doctor].concat(this.gameState.patients).concat(this.gameState.cars);
    if (this.gameState.facilityManager) {
       people.push(this.gameState.facilityManager);
       people.push({paint: () => this.gameState.facilityManager.paintFire(ctx), y: this.gameState.facilityManager.y - 1});
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

    // Space Hint for first patient
    if (this.gameState.closestPatientToDoctor && this.gameState.closestPatientToDoctor.id == 1 &&
        this.gameState.closestPatientToDoctor.state == PatientStates.WAIT_AT_RECEPTION) {
      mainFont.drawText(ctx, "Press space to talk to patient", ctx.canvas.width / 2, ctx.canvas.height * 0.7, "black", align = 0.5);
    }

    // Screen space UI
    this.gameState.hospital.draw(ctx);

    // Cashflow Feed
    this.cashflowFeed.draw(ctx);
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
    this.gameState.cars.forEach(c => c.update());

    this.spawnEntities();
};

GameStage.prototype.spawnEntities = function() {

    if ((this.gameState.facilityManager === null) && (this.time > this.facilityManagerDelay)) {
        this.gameState.facilityManager = this.spawnFacilityManager();
    }

    if (this.time > this.nextPatientSpawnTime) {
        this.spawnPatient();
    }

    if ((this.gameState.cars.length === 0) && (this.time > this.nextPoliceCarSpawnTime)) {
        this.spawnPoliceCar();
    }
    if ((this.gameState.cars.length === 0) && (this.time > this.nextMafiaCarSpawnTime)) {
        this.spawnMafiaCar();
    }
};


GameStage.prototype.spawnPatient = function() {
    const spawnPoint = this.getRandomElement(this.gameState.level.spawnPoints);
    if (spawnPoint !== null) {

        const health = (this.gameState.stats.patientCount < 4) ? 100 : rndInt(25, 100),
              wealth = rndInt(15, 100);
        let sickness = getRandomItem(this.gameState.sicknesses);
        if (this.gameState.stats.patientCount < this.gameState.sicknesses.length) {
            // First 7 or so patients all have different disease, so you see all the minigames if you're a good doctor
            sickness = this.gameState.sicknesses[this.gameState.sicknesses.length - this.gameState.stats.patientCount - 1];
        }
        const patient = new Patient(spawnPoint.x, spawnPoint.y, health, wealth, sickness, this.gameState);
        if (patient.executeAction("Register")) {
          this.gameState.patients.push(patient);
        }
    }
    this.nextPatientSpawnTimeFactor /= 1.04;
    const minTime = Math.max(4000, this.nextPatientSpawnTimeFactor * 13000);
    const maxTime = Math.min(8000, this.nextPatientSpawnTimeFactor * 23000);
    this.nextPatientSpawnTime = gameStage.time + interpolate(minTime, maxTime, Math.random());
};

GameStage.prototype.spawnFacilityManager = function() {
    const spawnPoint = this.getRandomElement(this.gameState.level.spawnPoints);
    if (spawnPoint !== null) {

        // Workaround: start music here since it's most likely loaded
        this.playAmbientMusic();
        this.playMusicTrack();

        const facilityManager = new FacilityManager(spawnPoint.x, spawnPoint.y, this.gameState);
        facilityManager.nextState();

        return facilityManager;
    }
};

GameStage.prototype.spawnPoliceCar = function() {

    this.nextPoliceCarSpawnTime = Infinity; // never spawn a new car until this car finishes
    const spawnPoint = this.gameState.level.spawnPointCar;
    const car = new PoliceCar(spawnPoint.x, spawnPoint.y, this.gameState, () => {
        this.nextPoliceCarSpawnTime = gameStage.time + interpolate(20000, 40000, Math.random());
        this.nextMafiaCarSpawnTime = gameStage.time + interpolate(5000, 15000, Math.random());
    });
    this.gameState.cars.push(car);
    car.nextState();

};

GameStage.prototype.spawnMafiaCar = function() {

    this.nextMafiaCarSpawnTime = Infinity; // never spawn a new car until this car finishes
    const spawnPoint = this.gameState.level.spawnPointCar;
    const car = new MafiaCar(spawnPoint.x, spawnPoint.y, this.gameState, () => {
        this.nextMafiaCarSpawnTime = gameStage.time + interpolate(20000, 40000, Math.random());
        this.nextPoliceCarSpawnTime = gameStage.time + interpolate(5000, 15000, Math.random());
    });
    this.gameState.cars.push(car);
    car.nextState();

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
        && !event.shiftKey && this.cashflowFeed.texts.filter(t => t.text.indexOf("Capslock") >= 0).length == 0) {
      this.cashflowFeed.addText("Activated Capslock may interfere with the game!", "yellow");
    }
    if (event.key === "Escape") {
        this.transitionIn("pause", 400);
    } else if (event.key === " ") {
        if (this.gameState.closestPatientToDoctor !== null) {
            this.contextStage = this.transitionIn("context", 300, { patient: this.gameState.closestPatientToDoctor });
        }
    }
    if (window["cheats"]) {
      if (event.key == "k") {
          // Kill all patients
          this.gameState.patients.forEach( p => p.die() );
      } else if (event.key == "f") {
        this.transitionIn("drug", 300, { patient: new Patient(5, 5, 100, 50, this.gameState.sicknesses[4], this.gameState)})
      } else if (event.key == "i") {
        // Diagnose all patients
        this.gameState.patients.forEach( p => p.diagnosed = true );
      } else if (event.key == "l") {
          this.gameState.hospital.balance += 100;
      }
    }
};

function isSpecialCharacter(char) {
  return ["!", "*", "§", "$", "%", "&", "@", "(", ")", "?"].indexOf(char) >= 0;
}
