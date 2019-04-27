function Tile(x, y, collide, isBed) {
    this.position = [x, y];
    this.collides = collide;
    this.isBed = isBed;
}

Tile.prototype.updatePosition = function(x, y) {
    this.position = [x, y];
}

Tile.prototype.updateCollision = function(collide) {
    this.collides = collide;
}

Tile.prototype.updateIsBed = function(isBed) {
    this.bed = bed;
}