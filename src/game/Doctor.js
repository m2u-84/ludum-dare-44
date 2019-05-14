/**
 * The player is a doctor
 */
function Doctor(x, y, sizeX, sizeY, gameState) {

    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.movingVelocity = 3; // tiles per second TODO: reduce to 2
    this.gameState = gameState;
    this.lastMoveDelta = {x: 0, y: 0};
    this.lastMoveTime = 0;
    this.directionFactor = 1;
    // TODO: use kind of enum
    this.characterStateIndex = 0;

    this.isMale = true; // TODO: why isn't this set via constructor?
}

Doctor.load = function() {

    const ASSETS_BASE_PATH = './assets/';
    const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';
    Doctor.soundWalking = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/feet-walking/feet-walking.mp3'});
};

Doctor.prototype.update = function() {

    this.handleKeys();
    if (gameStage.time - this.lastMoveTime > 100) {
        this.characterStateIndex = 0;
    }
    this.directionFactor = this.lastMoveDelta.x !== 0 ? Math.sign(this.lastMoveDelta.x) : this.directionFactor;
};

Doctor.prototype.assignGender = function(isMale) {
    this.isMale = isMale;
};

Doctor.prototype.getDeltaFromKeys = function() {

    let moveDelta = {x: 0, y: 0};
    if ((gameStage.getKeyState("ArrowUp")) || (gameStage.getKeyState("W"))) {
        moveDelta.y -= 1;
    }
    if ((gameStage.getKeyState("ArrowDown")) || (gameStage.getKeyState("S"))) {
        moveDelta.y += 1;
    }
    if ((gameStage.getKeyState("ArrowLeft")) || (gameStage.getKeyState("A"))) {
        moveDelta.x -= 1;
    }
    if ((gameStage.getKeyState("ArrowRight")) || (gameStage.getKeyState("D"))) {
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
        // TODO: work with closestBed
    }
};

Doctor.prototype.getClosestIdlePatient = function() {

    let closestPatientIndex = -1;
    let minDist = Infinity;
    let patients = this.gameState.patients;
    for (let patientIndex = 0; patientIndex < patients.length; patientIndex++) {
        let patient = patients[patientIndex];
        if (patient.isAddressable()) {
            const patientPos = patient.getAddressablePosition();
            let dist = vectorLength(this.x - patientPos.x, this.y - patientPos.y);
            if (dist < minDist) {
                minDist = dist;
                closestPatientIndex = patientIndex;
            }
        }
    }

    return {patient: closestPatientIndex > -1 ? patients[closestPatientIndex] : null, distance: minDist}
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

    let animationId = this.getAnimationId();

    // TODO: clarify relation between x,y and centerX, centerY
    let status = gameStage.animationPlayer.paint(ctx, animationId, this.x, this.y,
        0.5, 0.98, this.directionFactor < 0, false, 0);

    let frameChanged = status[0].changed;
    if ((this.characterStateIndex === 1) && (frameChanged)) {
        Doctor.soundWalking.stop();
        Doctor.soundWalking.play();
    }
};

Doctor.prototype.getAnimationId = function() {

    // TODO: use enums
    let gender = this.isMale ? "m" : "w";
    if (this.characterStateIndex === 0) {
        return "doctor-" + gender + "-idle";
    } else if (this.characterStateIndex === 1){
        return "doctor-" + gender + "-moving";
    } else {
        throw new Error("unhandled character state");
    }
};