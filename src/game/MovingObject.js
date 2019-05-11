function MovingObject(x, y, gameState) {
    this.x = x;
    this.y = y;

    this.movingVelocity = 3; // animation and moving speed
    this.idleVelocity = 1; // animation speed
    this.lastMoveDelta = {x: 0, y: 0};
    this.lastMoveTime = 0;
    this.directionFactor = {x: 1, y: 1};
    this.isCharacterMoving = false;
    this.path = null;
    this.pathLength = 0;
    this.pathStartedTime = 0;
    this.pathFinishedCallback = null;
    this.waitCheckCondition = null;
    this.waitFinished = null;

    this.gameState = gameState;
}

MovingObject.prototype.update = function() {

    this.processPath();
    if (this.waitCheckCondition) {
        if (this.waitCheckCondition()) {
            if (this.waitFinished) {
                const callback = this.waitFinished;
                this.endWaiting();
                callback();
            }
        }
    }
};

MovingObject.prototype.startWaiting = function(onCheckCondition, onFinished) {

    this.waitCheckCondition = onCheckCondition;
    this.waitFinished = onFinished;
};

MovingObject.prototype.startWaitingTime = function(time, onFinished) {

    const startTime = gameStage.time;
    this.startWaiting(() => gameStage.time - startTime >= time, onFinished);
};

MovingObject.prototype.endWaiting = function() {

    this.waitCheckCondition = null;
    this.waitFinished = null;
};

MovingObject.prototype.recomputeVelocity = function() {

};

MovingObject.prototype.moveTo = function(targetX, targetY, finishCallback, doShufflePath = true) {

    this.recomputeVelocity();
    const path = this.gameState.level.findPath(this.x, this.y, targetX, targetY, doShufflePath);
    this.planPath(path);
    this.pathFinishedCallback = finishCallback;
};

MovingObject.prototype.planPath = function(path) {

    if (this.path === null) {
        this.path = path;
        this.pathLength = this.gameState.level.computeLengthOfPath(path);
        this.pathStartedTime = gameStage.time;
    }
};

MovingObject.prototype.getPathProgress = function() {

    const millsecsForPath = this.pathLength / this.movingVelocity * 1000;
    const elapsedMillisecs = gameStage.time - this.pathStartedTime;
    const percentage = elapsedMillisecs / millsecsForPath;
    const floatingWaypointIndex = this.path.length * percentage;
    let waypointIndex = Math.floor(floatingWaypointIndex);
    waypointIndex = Math.min(this.path.length - 1, waypointIndex);
    const betweenPercent = floatingWaypointIndex - Math.floor(floatingWaypointIndex);

    return {waypointIndex: waypointIndex, betweenPercent: betweenPercent};
};

MovingObject.prototype.processPath = function() {

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
            this.finishPath();
        }
    }
};

MovingObject.prototype.finishPath = function() {

    this.path = null;
    if (this.pathFinishedCallback) {
        const callback = this.pathFinishedCallback;
        this.pathFinishedCallback = null;
        callback();
    }
};

MovingObject.prototype.updateCharacterPosition = function(x, y) {

    this.lastMoveDelta = {x: x - this.x, y: y - this.y};
    if ((this.lastMoveDelta.x !== 0) || (this.lastMoveDelta.y !== 0)) {
        this.x = x;
        this.y = y;
        this.isCharacterMoving = true;
        this.lastMoveTime = gameStage.time;
    }
};

MovingObject.prototype.getMoveTarget = function() {

    if ((this.path !== null) && (this.path.length > 0)) {
        const last = this.path[this.path.length - 1];
        return {x: last[0] + 0.5, y: last[1] + 0.5};
    }
    return null;
};

MovingObject.prototype.paint = function(ctx) {

    // Reset character state (idle, moving) shortly after walking ends
    if (gameStage.time - this.lastMoveTime > 100) {
        this.isCharacterMoving = false;
    }

    // Mirror character depending on last movement direction
    this.directionFactor.x = this.lastMoveDelta.x !== 0 ? Math.sign(this.lastMoveDelta.x) : this.directionFactor.x;
    this.directionFactor.y = this.lastMoveDelta.y !== 0 ? Math.sign(this.lastMoveDelta.y) : this.directionFactor.y;
    // TODO: remove frameIndexes
    const frameIndexes = this.getCharacterFrames(this.isCharacterMoving);
    // TODO: remove velocity?!
    const velocity = this.isCharacterMoving === 0 ? this.movingVelocity : this.idleVelocity;

    this.paintExecution(ctx, velocity, frameIndexes);
};

MovingObject.prototype.paintExecution = function(ctx, velocity, frameIndexes) {

};

MovingObject.prototype.getCharacterFrames = function(isMoving) {

};

MovingObject.prototype.isInSameTile = function(x1, y1, x2, y2) {

    const diffX = Math.abs(x1 - x2);
    const diffY = Math.abs(y1 - y2);
    return (diffX < 0.5) && (diffY < 0.5);
};

MovingObject.prototype.isFreeTile = function (x, y) {

    return !gameStage.gameState.level.isBlocked({x: x, y: y});
};
