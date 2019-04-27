/**
 * The player is a doctor
 */
function Doctor(x, y, sizeX, sizeY, gameState) {

    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.velocity = 1; // tiles per second
    this.gameState = gameState;
}

Doctor.prototype.update = function() {

    this.handleKeys();
};

Doctor.prototype.handleKeys = function() {

    const moveDelta = this.velocity * gameStage.timeDif / 1000;
    const moveTo = {x: this.x, y: this.y};
    if (gameStage.getKeyState("ArrowUp")) {
        moveTo.y -= moveDelta;
    }
    if (gameStage.getKeyState("ArrowDown")) {
        moveTo.y += moveDelta;
    }
    if (gameStage.getKeyState("ArrowLeft")) {
        moveTo.x -= moveDelta;
    }
    if (gameStage.getKeyState("ArrowRight")) {
        moveTo.x += moveDelta;
    }
    if (((moveTo.x !== this.x) || (moveTo.y !== this.y)) && (!this.collides(moveTo))) {
        this.x = moveTo.x;
        this.y = moveTo.y;
    }
    console.log(this.x + ", " + this.y)
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

    let bounds = this.computeBoundingRect(this.x, this.y);
    ctx.fillStyle= 'blue';
    ctx.fillRect(bounds.tl.x, bounds.tl.y, (bounds.tr.x - bounds.tl.x), (bounds.bl.y - bounds.tl.y));
};


