/**
 * The player is a doctor
 */
function Doctor(x, y, sizeX, sizeY) {
    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.velocity = 1; // tiles per second
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

    var left = target.x - this.sizeX / 2;
    var right = target.x + this.sizeX / 2;
    var top = target.y - this.sizeY / 2;
    var bottom = target.y - this.sizeY / 2;

    var topLeft = {x: left, y: top};
    var topRight = {x: right, y: top};
    var bottomLeft = {x: left, y: bottom};
    var bottomRight = {x: right, y: bottom};

    return !this.collidesPoint(topLeft) &&
        !this.collidesPoint(topRight) &&
        !this.collidesPoint(bottomLeft) &&
        !this.collidesPoint(bottomRight);
}

Doctor.prototype.collidesPoint = function(target) {

    return (target.x > 0) && (target.x < 10) && (target.y > 0) && (target.y < 10);
}

Doctor.prototype.paint = function() {

}


