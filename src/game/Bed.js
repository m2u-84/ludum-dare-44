function Bed(x, y) {
    let position1 = {x: x, y: y};
    let position2 = {x: x, y: y+1};
    this.positions = [position1, position2];
    this.occupiedBy = null;
}

Bed.load = function() {
    Bed.image = loader.loadImage("./assets/images/bed.png", 4, 2);
    Bed.headImage = loader.loadImage("./assets/images/bed_patients.png", 4, 3);
    Bed.busyImage = loader.loadImage("./assets/images/busy.png", 6, 1);
    Bed.busyFrames = [0, 0, 0, 1, 1, 2, 2, 3, 4, 5];
    Bed.sleepImage = loader.loadImage("./assets/images/sleeping.png", 4, 1);
    Bed.sleepFrames = [0, 1, 2, 3, 2, 1];
};

Bed.prototype.paint = function(ctx) {
    let x = this.positions[1].x, y = this.positions[1].y;
    const px = 1 / 24;
    let frame = 0, headFrame = -1;
    const patient = this.occupiedBy;
    if (patient) {
        frame = 1 + Math.floor((gameStage.time + patient.animationOffset) / 1600) % 2;
        headFrame = patient.imageIndex;
        if (patient.state == PatientStates.DEAD) {
            headFrame += 4;
            frame = 4;
        } else if (patient.state == PatientStates.ASLEEP) {
            headFrame += 8;
        }
        // Shake in case of death
        if (patient.state != PatientStates.DEAD && gameStage.timeDif > 0) {
            x += px * patient.shiverX;
            y += px * patient.shiverY;
        }
    }
    // Bed itself
    drawFrame(ctx, Bed.image, frame, x, y, 0, px, px, 0, 0.56);
    // Head in bed
    if (headFrame >= 0) {
        drawFrame(ctx, Bed.headImage, headFrame, x, y, 0, px, px, 0, 0.56);
    }
    // Highlight
    if (patient && patient == gameStage.gameState.closestPatientToDoctor) {
        drawFrame(ctx, Bed.image, 3, x, y, 0, px, px, 0, 0.56);
    }
    // Patient state dependent icons
    if (patient) {
        if (patient.state == PatientStates.DIAGNOSING) {
            const frame = getArrayFrame(gameStage.time / 150, Bed.busyFrames);
            drawFrame(ctx, Bed.busyImage, frame, x + 0.5, y - 1.33, 0, px, px, 0.5, 1);
        } else if (patient.state == PatientStates.ASLEEP) {
            const frame = getArrayFrame(gameStage.time / 300, Bed.sleepFrames);
            drawFrame(ctx, Bed.sleepImage, frame, x + 0.5, y - 1.4, 0, px, px, 0.5, 1);
        }
    }
};

Bed.prototype.occupy = function(patient) {
    if (this.occupiedBy) {
        throw new Error("Can't occupy preoccupied bed, noob.");
    }
    this.occupiedBy = patient;
};

Bed.prototype.releasePatient = function() {
    if (!this.occupiedBy) {
        throw new Error("Empty bed can't release patient");
    }
    this.occupiedBy = null;
};

Bed.prototype.getRevenue = function() {
    if (this.occupiedBy && !this.occupiedBy.isDead()) {
        if (this.occupiedBy.isRich) {
            return gameStage.gameState.currentLevel.params.balance.richBedRent;
        } else {
            return gameStage.gameState.currentLevel.params.balance.bedRent;
        }
    }
    return 0;
};

Bed.prototype.getVisitorPoints = function() {

    const xl = this.positions[0].x - 1;
    const xr = this.positions[0].x + 1;
    const y = this.positions[0].y;

    const left = {x: xl, y: y};
    const right = {x: xr, y: y};

    return {left: left, right: right};
};

Bed.prototype.getClosestVisitorPoint = function(fromX, fromY) {

    const visitorPoints = this.getVisitorPoints();

    const distLeft = gameStage.gameState.level.computePathAndLength(fromX, fromY,
        visitorPoints.left.x, visitorPoints.left.y );
    const distRight = gameStage.gameState.level.computePathAndLength(fromX, fromY,
        visitorPoints.right.x, visitorPoints.right.y);


    if (distLeft < distRight) {
        return visitorPoints.left;
    } else if (distLeft > distRight) {
        return visitorPoints.right;
    } else {
        if (Math.random() > 0.5) {
            return visitorPoints.left;
        } else {
            return visitorPoints.right;
        }
    }
};
