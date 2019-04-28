function Bed(x, y) {
    let position1 = {x: x, y: y};
    let position2 = {x: x, y: y+1};
    this.positions = [position1, position2];
    this.occupiedBy = null;
}

Bed.load = function() {
    Bed.image = loader.loadImage("./assets/bed.png", 4, 2);
    Bed.headImage = loader.loadImage("./assets/bed_patients.png", 4, 2);
};

Bed.prototype.paint = function(ctx) {
    let frame = 0, headFrame = -1;
    if (this.occupiedBy) {
        frame = 1 + Math.floor((gameStage.time + this.occupiedBy.animationOffset) / 1600) % 2;
        headFrame = this.occupiedBy.imageIndex;
        if (this.occupiedBy.state == PatientStates.DEAD) {
            headFrame += 4;
            frame = 1;
        }
    }
    drawFrame(ctx, Bed.image, frame, this.positions[1].x, this.positions[1].y, 0, 1/24, 1/24, 0, 0.56);
    if (headFrame >= 0) {
        drawFrame(ctx, Bed.headImage, headFrame, this.positions[1].x, this.positions[1].y, 0, 1/24, 1/24, 0, 0.56);
    }
    // Highlight
    if (this.occupiedBy && this.occupiedBy == gameStage.gameState.closestPatientToDoctor) {
        drawFrame(ctx, Bed.image, 3, this.positions[1].x, this.positions[1].y, 0, 1/24, 1/24, 0, 0.56);
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
    if (this.occupiedBy) {
        if (this.occupiedBy.isRich) {
            return 50;
        } else {
            return 10;
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
