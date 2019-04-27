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
    this.gameState.doctor.paint(ctx);
};

GameStage.prototype.update = function (timer) {
    if (this.timeDif == 0) {
        return;
    }
    this.gameState.doctor.update();

    const currentTime = this.time;
    if (currentTime - this.lastPatientSpawnTime > 10000) {
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

        this.gameState.patients.push(new Patient(x, y, health, wealth, sickness));
    }
};

GameStage.prototype.onkey = function (event) {
    if (event.key === "Escape") {
        // TODO this.transitionIn("pause", 400);
    } else if (event.key === "Enter") {
        this.transitionIn("organ");
    }
};
