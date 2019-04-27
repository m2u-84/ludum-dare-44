function GameStage() {
    Stage.call(this, "game", 0);
    this.gameState = new GameState();
    this.lastPatientSpawnTime = 0;
}

inherit(GameStage, Stage);

GameStage.prototype.preload = function () {
    this.gameState.init();
    this.mapImage = loader.loadImage("./assets/map.png");
    Doctor.load();
    Patient.load();
    Bed.load();
};

GameStage.prototype.render = function (ctx, timer) {
    var cellSize = 24;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.translate(w / 2, h / 2);
    ctx.scale(cellSize, cellSize);
    const offx = clamp(Math.round(-this.gameState.doctor.x * 24) / 24, -(this.mapImage.width - w / 2) / cellSize, -w / 2 / cellSize);
    const offy = clamp(Math.round(-this.gameState.doctor.y * 24) / 24, -(this.mapImage.height - h / 2) / cellSize, -h / 2 / cellSize);
    // console.log(offx, offy);
    ctx.translate(offx, offy);

    drawImage(ctx, this.mapImage, 0, 0, 0, 1 / cellSize, 1 / cellSize, 0, 0);

    for (let i = 0; i < this.gameState.level.beds.length; i++) {
        this.gameState.level.beds[i].paint(ctx);
    }

    const people = [this.gameState.doctor].concat(this.gameState.patients);
    people.sort((a,b) => a.y - b.y);
    people.forEach(p => p.paint(ctx));
};

GameStage.prototype.update = function (timer) {
    if (this.timeDif === 0) {
        return;
    }
    this.gameState.doctor.update();
    this.gameState.patients.forEach(p => p.update());

    const currentTime = this.time;
    if (currentTime - this.lastPatientSpawnTime > 3000) {
        this.lastPatientSpawnTime = currentTime;
        this.spawnPatient();
    }
};

GameStage.prototype.spawnPatient = function () {
    const spawnPoint = this.getRandomElement(this.gameState.level.spawnPoints);
    if (spawnPoint !== null) {

        const
            health = 100,
            wealth = 100,
            sickness = this.gameState.sicknesses[0];
        const patient = new Patient(spawnPoint.x, spawnPoint.y, health, wealth, sickness, this.gameState);
        patient.introduceAtReception(); // TODO: possibly try to respawn patient earlier if reception slot is blocked
    }
};

GameStage.prototype.getRandomElement = function(list) {

    if (list.length > 0) {
        return list[Math.floor(Math.random() * list.length)]
    }
    return null;
};

GameStage.prototype.onkey = function (event) {
    if (event.key === "Escape") {
        // TODO this.transitionIn("pause", 400);
    } else if (event.key === "Enter") {
        this.transitionIn(getRandomItem(["organ", "syringe"]));
    }
};
