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
    Bed.load();
};

GameStage.prototype.render = function (ctx, timer) {
    var cellSize = 24;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.translate(w / 2, h / 2);
    ctx.scale(cellSize, cellSize);
    const offx = clamp(Math.round(-this.gameState.doctor.x * 24) / 24, -(this.mapImage.width - w / 2) / cellSize, -w / 2 / cellSize);
    const offy = clamp(Math.round(-this.gameState.doctor.y * 24) / 24, -(this.mapImage.height - h / 2) / cellSize, -h / 2 / cellSize);
    console.log(offx, offy);
    ctx.translate(offx, offy);

    drawImage(ctx, this.mapImage, 0, 0, 0, 1 / cellSize, 1 / cellSize, 0, 0);

    for (let i = 0; i < this.gameState.level.beds.length; i++) {
        this.gameState.level.beds[i].paint(ctx);
    }

    this.gameState.doctor.paint(ctx);
    this.gameState.patients.forEach(p => p.paint(ctx));
};

GameStage.prototype.update = function (timer) {
    if (this.timeDif == 0) {
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
    if (this.gameState.patients.length === 0) {

        const y = 12, x = 12,
            health = 100,
            wealth = 100,
            sickness = this.gameState.sicknesses[0];

        const patient = new Patient(x, y, health, wealth, sickness);
        const path = gameStage.gameState.level.findPath(x, y, 8, 8);
        patient.planRoute(path, null);
        this.gameState.patients.push(patient);
    }
};

GameStage.prototype.onkey = function (event) {
    if (event.key === "Escape") {
        // TODO this.transitionIn("pause", 400);
    } else if (event.key === "Enter") {
        this.transitionIn("organ");
    }
};
