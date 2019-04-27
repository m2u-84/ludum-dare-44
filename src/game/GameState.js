function GameState() {
    this.level = new Level();
    this.doctor = new Doctor(5, 5, 0.5, 0.5, this);
}

GameState.prototype.checkCollision = function(target) {
    return this.level.checkCollision(target);
}