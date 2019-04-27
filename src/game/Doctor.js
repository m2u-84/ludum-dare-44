/**
 * The player is a doctor
 */
function Doctor(x, y, sizeX, sizeY, gameState) {

    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.movingVelocity = 4; // tiles per second TODO: reduce to 2
    this.idleVelocity = 1;
    this.gameState = gameState;
    this.lastMoveDelta = {x: 0, y: 0};
    this.lastMoveTime = 0;
    this.directionFactor = 1;
    this.characterStateIndex = 0;
    this.characterFrameIndexes = [
        [1, 4, 5, 5, 5, 5, 5, 5, 5, 4, 1, 1, 1, 1, 1, 1, 1, 1], // idle
        [0, 1, 2, 3, 2, 1] // moving
    ];
}

Doctor.load = function() {

    Doctor.image = loader.loadImage("./assets/doctor_m.png", 4, 3);
};

Doctor.prototype.update = function() {

    this.handleKeys();
};

Doctor.prototype.getDeltaFromKeys = function() {

    let moveDelta = {x: 0, y: 0};
    if (gameStage.getKeyState("ArrowUp")) {
        moveDelta.y -= 1;
    }
    if (gameStage.getKeyState("ArrowDown")) {
        moveDelta.y += 1;
    }
    if (gameStage.getKeyState("ArrowLeft")) {
        moveDelta.x -= 1;
    }
    if (gameStage.getKeyState("ArrowRight")) {
        moveDelta.x += 1;
    }
    return moveDelta;
};

Doctor.prototype.tryMove = function(delta) {

    let moved = false;
    let moveLen = vectorLength(delta.x, delta.y);

    if (moveLen > 0) {
        let scale = this.movingVelocity * gameStage.timeDif / 1000;
        delta.x = delta.x / moveLen * scale;
        delta.y = delta.y / moveLen * scale;
        const moveToX = {x: this.x + delta.x, y: this.y};
        if (!this.collides(moveToX)) {
            this.x = moveToX.x;
            moved = true;
        }
        const moveToY = {x: this.x, y: this.y + delta.y};
        if (!this.collides(moveToY)) {
            this.y = moveToY.y;
            moved = true;
        }

        return moved;
    }
};

Doctor.prototype.handleKeys = function() {

    const moveDelta = this.getDeltaFromKeys();
    this.lastMoveDelta = moveDelta;
    if (this.tryMove(moveDelta)) {
        this.characterStateIndex = 1;
        this.lastMoveTime = gameStage.time;
        let closestBed = this.getClosestBed();
    }
};

Doctor.prototype.getClosestBed = function() {

    let closestBedIndex = -1;
    let minDist = Infinity;
    let beds = this.gameState.level.beds;
    for (let bedIndex = 0; bedIndex < beds.length; bedIndex++) {
        let positions = beds[bedIndex].positions;
        for (let posIndex = 0; posIndex < positions.length; posIndex++) {
            let pos = positions[posIndex];
            let dist = vectorLength(this.x - pos.x, this.y - pos.y);
            if (dist < minDist) {
                minDist = dist;
                closestBedIndex = bedIndex;
            }
        }
    }

    return {bed: closestBedIndex > -1 ? beds[closestBedIndex] : null, distance: minDist}
};

Doctor.prototype.collides = function(target) {

    const bounds = this.computeBoundingRect(target.x, target.y);
    return this.collidesPoint(bounds.tl) ||
        this.collidesPoint(bounds.tr) ||
        this.collidesPoint(bounds.bl) ||
        this.collidesPoint(bounds.br);
};

Doctor.prototype.computeBoundingRect = function(x, y) {

    const left = x - this.sizeX / 2;
    const right = x + this.sizeX / 2;
    const top = y + this.sizeY / 2;
    const bottom = y - this.sizeY / 2;

    const topLeft = {x: left, y: top};
    const topRight = {x: right, y: top};
    const bottomLeft = {x: left, y: bottom};
    const bottomRight = {x: right, y: bottom};

    return {tl: topLeft, tr: topRight, bl: bottomLeft, br: bottomRight};
};

Doctor.prototype.collidesPoint = function(target) {
    return this.gameState.isBlocked(target);
};

Doctor.prototype.paint = function(ctx) {

    /*
    let bounds = this.computeBoundingRect(this.x, this.y);
    ctx.fillStyle= 'blue';
    ctx.fillRect(bounds.tl.x, bounds.tl.y, (bounds.tr.x - bounds.tl.x), (bounds.bl.y - bounds.tl.y));
    */
    if (gameStage.time - this.lastMoveTime > 100) {
        this.characterStateIndex = 0;
    }

    this.directionFactor = this.lastMoveDelta.x !== 0 ? Math.sign(this.lastMoveDelta.x) : this.directionFactor;
    const frames = this.characterFrameIndexes[this.characterStateIndex];
    const frameCount = frames.length;
    const velocity = this.characterStateIndex === 0 ? this.idleVelocity : this.movingVelocity;
    const frameIndex = Math.floor(gameStage.time / (200 / velocity)) % frameCount;
    drawFrame(ctx, Doctor.image, frames[frameIndex], this.x, this.y, 0, this.directionFactor * 1/24, 1/24, 0.5, 0.98);
};
