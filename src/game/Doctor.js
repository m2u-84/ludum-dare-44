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
    /*
    collision checks (access to map)
    */
}

Doctor.prototype.handleKeys = function() {

    var moveDelta = this.velocity * gameStage.timeDif / 1000;
    var moveTo = {x: this.x, y: this.y};
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
    if (((moveTo.x != this.x) || (moveTo.y != this.y)) && (!this.collides(moveTo))) {
        this.x = moveTo.x;
        this.y = moveTo.y;
    }
    console.log(this.x + ", " + this.y)
}

Doctor.prototype.collides = function(target) {

    var bounds = this.computeBoundingRect(target.x, target.y);
    return this.collidesPoint(bounds.tl) ||
        this.collidesPoint(bounds.tr) ||
        this.collidesPoint(bounds.bl) ||
        this.collidesPoint(bounds.br);
}

Doctor.prototype.computeBoundingRect = function(x, y) {

    var left = x - this.sizeX / 2;
    var right = x + this.sizeX / 2;
    var top = y + this.sizeY / 2;
    var bottom = y - this.sizeY / 2;

    var topLeft = {x: left, y: top};
    var topRight = {x: right, y: top};
    var bottomLeft = {x: left, y: bottom};
    var bottomRight = {x: right, y: bottom};

    return {tl: topLeft, tr: topRight, bl: bottomLeft, br: bottomRight};
}

Doctor.prototype.collidesPoint = function(target) {
//    return ((target.x < 0) || (target.x > 8) || (target.y < 0) || (target.y > 8));
    return this.gameState.isBlocked(target);
}

Doctor.prototype.paint = function(ctx) {

    var bounds = this.computeBoundingRect(this.x, this.y);
    ctx.fillStyle= 'blue';
    ctx.fillRect(bounds.tl.x, bounds.tl.y, (bounds.tr.x - bounds.tl.x), (bounds.bl.y - bounds.tl.y));
}


