function Tile(x, y, collide) {
    this.position = [x, y];
    this.collides = collide;
}

Tile.prototype.updatePosition = function(x, y) {
    this.position = [x, y];
}

Tile.prototype.updateCollision = function(collide) {
    this.collides = collide;
}