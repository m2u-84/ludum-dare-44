function Bed(x, y) {
    let position1 = {x: x, y: y};
    let position2 = {x: x, y: y+1};
    this.positions = [position1, position2];
}

Bed.load = function() {
    Bed.image = loader.loadImage("./assets/bed.png", 4, 2);
};

Bed.prototype.paint = function(ctx) {
    drawFrame(ctx, Bed.image, 0, this.positions[1].x, this.positions[1].y, 0, 1/24, 1/24, 0, 0.56);
};
