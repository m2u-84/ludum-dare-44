function WalkingPerson(x, y, gameState) {
    this.x = x;
    this.y = y;

    this.movingVelocity = 4; // animation speed
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
    this.pathLength = 0;
    this.pathStartedTime = 0;

    this.gameState = gameState;
}

WalkingPerson.prototype.update = function() {

    this.processPath();
};

WalkingPerson.prototype.moveTo = function(targetX, targetY) {

    const path = this.gameState.level.findPath(this.x, this.y, targetX, targetY);
    this.planPath(path);
};

WalkingPerson.prototype.planPath = function(path) {

    if (this.path === null) {
        this.path = path;
        this.pathLength = 0;
        for (let i=0; i < path.length - 1; i++) {
            const currentPoint = path[i];
            const destPoint = path[i+1];
            const dist = vectorLength(currentPoint[0] - destPoint[0], currentPoint[1] - destPoint[1]);
            this.pathLength += dist;
            this.pathStartedTime = gameStage.time;
        }
    }
};

WalkingPerson.prototype.getPathProgress = function() {

    const millsecsForPath = this.pathLength / this.movingVelocity * 1000;
    const elapsedMillisecs = gameStage.time - this.pathStartedTime;
    const percentage = elapsedMillisecs / millsecsForPath;
    const floatingWaitpointIndex = this.path.length * percentage;
    let waypointIndex = Math.floor(floatingWaitpointIndex);
    waypointIndex = Math.min(this.path.length - 1, waypointIndex);
    const betweenPercent = floatingWaitpointIndex - Math.floor(floatingWaitpointIndex);

    return {waypointIndex: waypointIndex, betweenPercent: betweenPercent};
};

WalkingPerson.prototype.processPath = function() {

    if (this.path !== null) {
        const pos = this.getPathProgress();
        if (pos.waypointIndex < this.path.length - 1) {
            const elem1 = this.path[pos.waypointIndex];
            const elem2 = this.path[pos.waypointIndex + 1];
            const x = interpolate(elem1[0], elem2[0], pos.betweenPercent);
            const y = interpolate(elem1[1], elem2[1], pos.betweenPercent);
            this.updateCharacterPosition(x + 0.5, y + 0.5);
        } else {
            const elem = this.path[pos.waypointIndex];
            this.updateCharacterPosition(elem[0] + 0.5, elem[1] + 0.5);
            this.path = null;
            this.pathFinished();
        }
    }
};

WalkingPerson.prototype.pathFinished = function() {

};

WalkingPerson.prototype.updateCharacterPosition = function(x, y) {

    this.lastMoveDelta = {x: x - this.x, y: y - this.y};
    if ((this.lastMoveDelta.x !== 0) || (this.lastMoveDelta.y !== 0)) {
        this.x = x;
        this.y = y;
        this.characterStateIndex = 1;
        this.lastMoveTime = gameStage.time;
    }
};

WalkingPerson.prototype.getMoveTarget = function() {

    if ((this.path !== null) && (this.path.length > 0)) {
        const last = this.path[this.path.length - 1];
        return {x: last[0] + 0.5, y: last[1] + 0.5};
    }
    return null;
};

WalkingPerson.prototype.paint = function(ctx) {

    // Reset character state (idle, moving) shortly after walking ends
    if (gameStage.time - this.lastMoveTime > 100) {
        this.characterStateIndex = 0;
    }

    // Mirror character depending on last movement direction
    this.directionFactor = this.lastMoveDelta.x !== 0 ? Math.sign(this.lastMoveDelta.x) : this.directionFactor;
    const frames = this.characterFrameIndexes[this.characterStateIndex];
    const frameCount = frames.length;
    const velocity = this.characterStateIndex === 0 ? this.idleVelocity : this.movingVelocity;

    this.paintExecution(ctx, frameCount, velocity, frames);
};

WalkingPerson.prototype.paintExecution = function(ctx, frameCount, velocity, frames) {

};
