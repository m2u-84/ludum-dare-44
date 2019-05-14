function GameStage() {
    Stage.call(this, "game", 0);
    this.gameState = null;
    this.contextStage = null;
    this.floatingTexts = [];
    this.cashflowFeed = new CashflowFeed();
    this.nextPatientSpawnTimeFactor = 1;
    this.drawFPS = true;
    this.fpsCounter = new FpsCounter(1000);
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

    this.loadAnimations();

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

GameStage.prototype.loadAnimations = function() {

    this.animationPlayer = new AnimationPlayer(() => {
        return this.time;
    }, 24);

    this.loadDoctorSprites();
    this.loadFacilityManagerSprites();
    this.loadPatientSprites();
    this.loadCarSprites();
    this.loadOtherSprites();
};

GameStage.prototype.loadDoctorSprites = function(payload) {

    this.animationPlayer.loadSprites("doctor-0-m", "./assets/images/doctor_m.png", 4, 3);
    this.animationPlayer.loadSprites("doctor-0-w", "./assets/images/doctor_w.png", 4, 3);

    let doctorFrameIndexesMoving = [0, 1, 2, 3, 2, 1];
    let doctorFrameIndexesIdle = [1, 4, 5, 5, 5, 5, 5, 5, 5, 4, 1, 1, 1, 1, 1, 1, 1, 1];
    let doctorVariants = ["m", "w"];
    for (let i=0; i < doctorVariants.length; i++) {
        let v = doctorVariants[i];
        // TODO: interpolation syntax?
        this.animationPlayer.createAnimation("doctor-" + v + "-moving");
        this.animationPlayer.addAnimation("doctor-" + v + "-moving", "doctor-0-" + v, 75, true, true, doctorFrameIndexesMoving);
        this.animationPlayer.createAnimation("doctor-" + v + "-idle");
        this.animationPlayer.addAnimation("doctor-" + v + "-idle", "doctor-0-" + v, 150, true, true, doctorFrameIndexesIdle);
    }
};

GameStage.prototype.loadFacilityManagerSprites = function(payload) {

    this.animationPlayer.loadSprites("facility-manager", "./assets/images/facility_manager.png", 4, 3);

    let facilityManagerFrameIndexesMoving = [0, 1, 2, 3, 2, 1];
    let facilityManagerFrameIndexesIdle = [4, 5, 6, 6, 6, 6, 5, 4, 4, 4];
    let facilityManagerFrameIndexesCarrying = [8, 9, 10, 11, 10, 9];
    this.animationPlayer.createAnimation("facility-manager-moving");
    this.animationPlayer.addAnimation("facility-manager-moving", "facility-manager", 75, true, true, facilityManagerFrameIndexesMoving);
    this.animationPlayer.createAnimation("facility-manager-idle");
    this.animationPlayer.addAnimation("facility-manager-idle", "facility-manager", 75, true, true, facilityManagerFrameIndexesIdle);
    this.animationPlayer.createAnimation("facility-manager-carrying");
    this.animationPlayer.addAnimation("facility-manager-carrying", "facility-manager", 75, true, true, facilityManagerFrameIndexesCarrying);
};

GameStage.prototype.loadPatientSprites = function(payload) {

    this.patientAnimations = [];

    this.animationPlayer.loadSprites(this.getMaleNonRichHeadName(0), "./assets/images/patient_head0.png", 4, 3);
    this.animationPlayer.loadSprites(this.getMaleNonRichHeadName(1), "./assets/images/patient_head1.png", 4, 3);
    this.animationPlayer.loadSprites(this.getMaleRichHeadName(0), "./assets/images/patient_head3.png", 4, 3);
    this.animationPlayer.loadSprites(this.getFemaleNonRichHeadName(0), "./assets/images/patient_head2.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexNonRichShirtName(0), "./assets/images/patient_shirt0.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexNonRichShirtName(1), "./assets/images/patient_shirt2.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexNonRichShirtName(2), "./assets/images/patient_shirt3.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexNonRichShirtName(3), "./assets/images/patient_shirt4.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexNonRichShirtName(4), "./assets/images/patient_shirt5.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexNonRichShirtName(5), "./assets/images/patient_shirt6.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexRichShirtName(0), "./assets/images/patient_shirt1.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexLegName(0), "./assets/images/patient_leg0.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexLegName(1), "./assets/images/patient_leg2.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexLegName(2), "./assets/images/patient_leg3.png", 4, 3);
    this.animationPlayer.loadSprites(this.getUnisexLegName(3), "./assets/images/patient_leg4.png", 4, 3);
    this.animationPlayer.loadSprites(this.getWomenLegName(0), "./assets/images/patient_leg1.png", 4, 3);

    let iMoving = [0, 1, 2, 3, 2, 1];
    let iIdle25 = [1, 4, 5, 4];
    let iIdle50 = [1, 4, 5, 5, 4, 1];
    let iIdle100 = [1, 4, 5, 5, 5, 5, 4, 1, 1, 1];
    let iDead = [1, 6, 6, 7, 7];

    this.createNonRichMen(2, 6, 4, iMoving, iIdle100, iIdle50, iIdle25, iDead);
    this.createRichMen(1, 1,4, iMoving, iIdle100, iIdle50, iIdle25, iDead);
    this.createNonRichWomen(1, 6, 4, iMoving, iIdle100, iIdle50, iIdle25, iDead);
    this.createRichWomen(1, 1,4, iMoving, iIdle100, iIdle50, iIdle25, iDead);
};

GameStage.prototype.getMaleNonRichHeadName = function(index) {

    return "patient-head-men-nr-" + index;
};

GameStage.prototype.getMaleRichHeadName = function(index) {

    return "patient-head-men-r-" + index;
};

GameStage.prototype.getFemaleNonRichHeadName = function(index) {

    return "patient-head-women-nr-" + index;
};

GameStage.prototype.getUnisexNonRichShirtName = function(index) {

    return "patient-shirt-unisex-nr-" + index;
};

GameStage.prototype.getUnisexRichShirtName = function(index) {

    return "patient-shirt-unisex-r-" + index;
};

GameStage.prototype.getUnisexLegName = function(index) {

    return "patient-leg-unisex-" + index;
};

GameStage.prototype.getWomenLegName = function(index) {

    return "patient-leg-women-" + index;
};

GameStage.prototype.createPatientAnimations = function(headSprite, shirtSprite, legSprite, iMoving, iIdle100, iIdle50, iIdle25, iDead) {

    let animationBaseName = "patient-" + this.patientAnimations.length;
    this.patientAnimations.push(animationBaseName);
    let animationNameMoving = animationBaseName + "-moving";
    let animationNameIdle25 = animationBaseName + "-idle-25";
    let animationNameIdle50 = animationBaseName + "-idle-50";
    let animationNameIdle100 = animationBaseName + "-idle-100";
    let animationNameDead = animationBaseName + "-dead";
    this.animationPlayer.createAnimation(animationNameMoving);
    this.animationPlayer.addAnimation(animationNameMoving, legSprite, 75, true, true, iMoving);
    this.animationPlayer.addAnimation(animationNameMoving, headSprite, 75, true, true, iMoving);
    this.animationPlayer.addAnimation(animationNameMoving, shirtSprite, 75, true, true, iMoving);
    this.animationPlayer.createAnimation(animationNameIdle25);
    this.animationPlayer.addAnimation(animationNameIdle25, legSprite, 75, true, true, iIdle25);
    this.animationPlayer.addAnimation(animationNameIdle25, headSprite, 75, true, true, iIdle25);
    this.animationPlayer.addAnimation(animationNameIdle25, shirtSprite, 75, true, true, iIdle25);
    this.animationPlayer.createAnimation(animationNameIdle50);
    this.animationPlayer.addAnimation(animationNameIdle50, legSprite, 75, true, true, iIdle50);
    this.animationPlayer.addAnimation(animationNameIdle50, headSprite, 75, true, true, iIdle50);
    this.animationPlayer.addAnimation(animationNameIdle50, shirtSprite, 75, true, true, iIdle50);
    this.animationPlayer.createAnimation(animationNameIdle100);
    this.animationPlayer.addAnimation(animationNameIdle100, legSprite, 75, true, true, iIdle100);
    this.animationPlayer.addAnimation(animationNameIdle100, headSprite, 75, true, true, iIdle100);
    this.animationPlayer.addAnimation(animationNameIdle100, shirtSprite, 75, true, true, iIdle100);
    this.animationPlayer.createAnimation(animationNameDead);
    this.animationPlayer.addAnimation(animationNameDead, legSprite, 250, false, true, iDead);
    this.animationPlayer.addAnimation(animationNameDead, headSprite, 250, false, true, iDead);
    this.animationPlayer.addAnimation(animationNameDead, shirtSprite, 250, false, true, iDead);

};

GameStage.prototype.createNonRichMen = function(headMenNonRichCount, shirtUnisexNonRichCount, legUnisexCount,
    iMoving, iIdle100, iIdle50, iIdle25, iDead) {

    for (let iHead=0; iHead < headMenNonRichCount; iHead++) {
        for (let iShirt=0; iShirt < shirtUnisexNonRichCount; iShirt++) {
            for (let iLeg=0; iLeg < legUnisexCount; iLeg++) {
                this.createPatientAnimations(this.getMaleNonRichHeadName(iHead),
                    this.getUnisexNonRichShirtName(iShirt),
                    this.getUnisexLegName(iLeg),
                    iMoving, iIdle100, iIdle50, iIdle25, iDead);
            }
        }
    }
};

GameStage.prototype.createRichMen = function(headMenRichCount, shirtUnisexRichCount, legUnisexCount,
    iMoving, iIdle100, iIdle50, iIdle25, iDead) {

    for (let iHead=0; iHead < headMenRichCount; iHead++) {
        for (let iShirt=0; iShirt < shirtUnisexRichCount; iShirt++) {
            for (let iLeg=0; iLeg < legUnisexCount; iLeg++) {
                this.createPatientAnimations(this.getMaleRichHeadName(iHead),
                    this.getUnisexRichShirtName(iShirt),
                    this.getUnisexLegName(iLeg),
                    iMoving, iIdle100, iIdle50, iIdle25, iDead);
            }
        }
    }
};

GameStage.prototype.createRichWomen = function(headWomenNonRichCount, shirtUnisexRichCount, legUnisexCount, legWomanCount,
    iMoving, iIdle100, iIdle50, iIdle25, iDead) {

    for (let iHead=0; iHead < headWomenNonRichCount; iHead++) {
        for (let iShirt=0; iShirt < shirtUnisexRichCount; iShirt++) {
            for (let iLeg=0; iLeg < legUnisexCount; iLeg++) {
                this.createPatientAnimations(this.getFemaleNonRichHeadName(iHead),
                    this.getUnisexRichShirtName(iShirt),
                    this.getUnisexLegName(iLeg),
                    iMoving, iIdle100, iIdle50, iIdle25, iDead);
            }
        }
    }

    for (let iHead=0; iHead < headWomenNonRichCount; iHead++) {
        for (let iShirt=0; iShirt < shirtUnisexRichCount; iShirt++) {
            for (let iLeg=0; iLeg < legWomanCount; iLeg++) {
                this.createPatientAnimations(this.getFemaleNonRichHeadName(iHead),
                    this.getUnisexRichShirtName(iShirt),
                    this.getWomenLegName(iLeg),
                    iMoving, iIdle100, iIdle50, iIdle25, iDead);
            }
        }
    }
};

GameStage.prototype.createNonRichWomen = function(headWomenNonRichCount, shirtUnisexNonRichCount, legUnisexCount, legWomanCount,
    iMoving, iIdle100, iIdle50, iIdle25, iDead) {

    for (let iHead=0; iHead < headWomenNonRichCount; iHead++) {
        for (let iShirt=0; iShirt < shirtUnisexNonRichCount; iShirt++) {
            for (let iLeg=0; iLeg < legUnisexCount; iLeg++) {
                this.createPatientAnimations(this.getFemaleNonRichHeadName(iHead),
                    this.getUnisexNonRichShirtName(iShirt),
                    this.getUnisexLegName(iLeg),
                    iMoving, iIdle100, iIdle50, iIdle25, iDead);
            }
        }
    }

    for (let iHead=0; iHead < headWomenNonRichCount; iHead++) {
        for (let iShirt=0; iShirt < shirtUnisexNonRichCount; iShirt++) {
            for (let iLeg=0; iLeg < legWomanCount; iLeg++) {
                this.createPatientAnimations(this.getFemaleNonRichHeadName(iHead),
                    this.getUnisexNonRichShirtName(iShirt),
                    this.getWomenLegName(iLeg),
                    iMoving, iIdle100, iIdle50, iIdle25, iDead);
            }
        }
    }
};

GameStage.prototype.loadCarSprites = function(payload) {

    this.animationPlayer.loadSprites("police-car", "./assets/images/police_car.png", 4, 2);
    this.animationPlayer.loadSprites("mafia-car", "./assets/images/mafia_car.png", 4, 2);

    let policeCarFramesMoving = [0, 1, 2, 3];
    let policeCarFramesWaiting = [0];
    let policeCarFramesIdle = [4, 5, 6, 7];
    this.animationPlayer.createAnimation("police-car-moving");
    this.animationPlayer.addAnimation("police-car-moving", "police-car", 150, true, true, policeCarFramesMoving);
    this.animationPlayer.createAnimation("police-car-waiting");
    this.animationPlayer.addAnimation("police-car-waiting", "police-car", 150, true, true, policeCarFramesWaiting);
    this.animationPlayer.createAnimation("police-car-idle");
    this.animationPlayer.addAnimation("police-car-idle", "police-car", 150, true, true, policeCarFramesIdle);

    let mafiaCarFramesMoving = [0, 1, 2, 3];
    let mafiaCarFramesWaiting = [0];
    let mafiaCarFramesIdle = [4, 5, 6, 7];
    this.animationPlayer.createAnimation("mafia-car-moving");
    this.animationPlayer.addAnimation("mafia-car-moving", "mafia-car", 150, true, true, mafiaCarFramesMoving);
    this.animationPlayer.createAnimation("mafia-car-waiting");
    this.animationPlayer.addAnimation("mafia-car-waiting", "mafia-car", 150, true, true, mafiaCarFramesWaiting);
    this.animationPlayer.createAnimation("mafia-car-idle");
    this.animationPlayer.addAnimation("mafia-car-idle", "mafia-car", 150, true, true, mafiaCarFramesIdle);
};

GameStage.prototype.loadOtherSprites = function(payload) {

    this.animationPlayer.loadSprites("dumpster-fire", "./assets/images/dumpsterfire.png", 4, 1);

    let pileFireFrames = [0, 1, 2, 3];
    this.animationPlayer.createAnimation("dumpster-fire");
    this.animationPlayer.addAnimation("dumpster-fire", "dumpster-fire", 150, true, true, pileFireFrames);
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
    if (this.gameState.closestPatientToDoctor && this.gameState.closestPatientToDoctor.id <= 3 &&
        this.gameState.closestPatientToDoctor.state == PatientStates.WAIT_AT_RECEPTION && this.active) {
      mainFont.drawText(ctx, "Press space to talk to patient", ctx.canvas.width / 2, ctx.canvas.height * 0.7,
            "red", 0.5, BitmapFontStyle.OUTLINE);
    }

    // Screen space UI
    this.gameState.hospital.draw(ctx);
    // FPS Counter
    const fps = this.fpsCounter.update();
    if (this.drawFPS) {
        bigFont.drawText(ctx, "" + fps, 5, ctx.canvas.height - 20, "yellow", 0, BitmapFontStyle.OUTLINE);
    }

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

        const health = (this.gameState.stats.patientCount < 4) ? 100 : rndInt(35, 100),
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
    if (event.key === "f") {
        this.drawFPS = !this.drawFPS;
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
