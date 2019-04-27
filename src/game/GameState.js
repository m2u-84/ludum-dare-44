function GameState() {
    this.level = new Level();
    this.doctor = new Doctor(13, 13, 0.5, 0.5, this);
}

GameState.prototype.init = function() {
    this.level.init();
}

GameState.prototype.isBlocked = function(target) {
    return this.level.isBlocked(target);
}

GameState.prototype.getBed = function(target) {
    return this.level.getBed(target);
}