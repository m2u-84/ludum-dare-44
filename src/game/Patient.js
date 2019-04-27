function Patient(x, y, health, wealth, sickness, gameState) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.wealth = wealth;
    this.sickness = sickness;
    this.diagnosed = false;
    this.inBed = null;
    this.animationOffset = rnd(9999);

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

    this.gameState = gameState;
}

Patient.load = function() {

    Patient.image = loader.loadImage("./assets/patient1.png", 4, 3); // TODO: Random Patient Image?
};

Patient.prototype.update = function() {

    this.processPath();
};

Patient.prototype.moveTo = function(targetX, targetY) {
    const path = this.gameState.level.findPath(this.x, this.y, targetX, targetY);
    this.planPath(path);
};

Patient.prototype.planPath = function(path) {

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
        this.lastPathProcessTime = 0;
    }
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

Patient.prototype.getMoveTarget = function() {

    if ((this.path !== null) && (this.path.length > 0)) {
        const last = this.path[this.path.length - 1];
        return {x: last[0], y: last[1]};
    }
    return null;
};

Patient.prototype.paint = function(ctx) {
    if (this.inBed) {
      return;
    }

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
    const frameIndex = Math.floor((gameStage.time + this.animationOffset) / (200 / velocity)) % frameCount;
    drawFrame(ctx, Patient.image, frames[frameIndex], this.x, this.y, 0, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
};

Patient.prototype.enterBed = function(bed) {
    if (this.inBed) {
      throw new Error("Can't enter bed while already in bed. Noob.");
    }
    bed.occupy(this);
    this.inBed = bed;
    this.x = bed.positions[0].x;
    this.y = bed.positions[0].y;
};
