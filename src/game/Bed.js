function Bed(x, y) {
    let position1 = {x: x, y: y};
    let position2 = {x: x, y: y+1};
    this.positions = [position1, position2];
    this.occupiedBy = null;
}

Bed.load = function() {
    Bed.image = loader.loadImage("./assets/bed.png", 4, 2);
};

Bed.prototype.paint = function(ctx) {
    let frame = 0;
    if (this.occupiedBy) {
        frame = 1 + Math.floor((gameStage.time + this.occupiedBy.animationOffset) / 1600) % 2;
    } 
    drawFrame(ctx, Bed.image, frame, this.positions[1].x, this.positions[1].y, 0, 1/24, 1/24, 0, 0.56);
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
