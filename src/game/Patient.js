function Patient(x, y, health, wealth, sickness) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.wealth = wealth;
    this.sickness = sickness;
    this.diagnosed = false;

    this.movingVelocity = 2; // animation speed
    this.idleVelocity = 1;
    this.lastMoveDelta = {x: 0, y: 0};
    this.lastMoveTime = 0;
    this.directionFactor = 1;
    this.characterStateIndex = 0;
    this.characterFrameIndexes = [
        [1, 4, 5, 5, 5, 4, 1, 1], // idle
        [0, 1, 2, 3, 2, 1] // moving
    ];
    this.path = null;
    this.pathDestReachedCallback = null;
    this.lastPathProcessTime = 0;
    this.pathSmoothness = 50;
}

Patient.load = function() {

    Patient.image = loader.loadImage("./assets/doctor_m.png", 4, 3); // TODO: new gfx for patient
};

Patient.prototype.update = function() {

    this.processPath();
};

Patient.prototype.processPath = function() {

    if (this.path !== null) {
        if (this.path.length === 0) {
            this.path = null;
            if (this.pathDestReachedCallback !== null) {
                this.pathDestReachedCallback(this);
            }
            return;
        }
        const currentTime = gameStage.time;
        if (currentTime - this.lastPathProcessTime > 25 / this.pathSmoothness) {
            this.lastPathProcessTime = currentTime;

            const elem = this.path[0];
            this.path.shift();
            this.updateCharacterPosition(elem[0], elem[1]);
        }

    }
};

Patient.prototype.updateCharacterPosition = function(x, y) {

    this.lastMoveDelta = {x: x - this.x, y: y - this.y};
    this.x = x;
    this.y = y;
    this.characterStateIndex = 1;
    this.lastMoveTime = gameStage.time;
};

Patient.prototype.planRoute = function(path, pathDestReachedCallback) {

    if (this.path === null) {
        this.path = [];
        for (let i=0; i < path.length - 1; i++) {
            const currentPoint = path[i];
            const destPoint = path[i+1];
            const steps = this.pathSmoothness;
            for (let step=0; step < steps; step++) {
                let point = [0.5 + interpolate(currentPoint[0], destPoint[0], step / steps),
                    0.5 + interpolate(currentPoint[1], destPoint[1], step / steps)];
                this.path.push(point);
            }
        }
        this.pathDestReachedCallback = pathDestReachedCallback;
        this.lastPathProcessTime = 0;
    }
};

Patient.prototype.paint = function(ctx) {

    // Reset character state (idle, moving) shortly after walking ends
    if (gameStage.time - this.lastMoveTime > 100) {
        this.characterStateIndex = 0;
    }

    // mirror character depending on last movement direction
    this.directionFactor = this.lastMoveDelta.x !== 0 ? Math.sign(this.lastMoveDelta.x) : this.directionFactor;
    const frames = this.characterFrameIndexes[this.characterStateIndex];
    const frameCount = frames.length;
    const velocity = this.characterStateIndex === 0 ? this.idleVelocity : this.movingVelocity;

    // determine sequential frame index using game time
    const frameIndex = Math.floor(gameStage.time / (200 / velocity)) % frameCount;
    drawFrame(ctx, Doctor.image, frames[frameIndex], this.x, this.y, 0, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
};
