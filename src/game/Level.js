// define Level class
function Level() {
    // used for collision detection
    this.tilemap = [
        [
            new Tile(0, 0, true),
            new Tile(1, 0, true),
            new Tile(2, 0, true),
            new Tile(3, 0, true),
            new Tile(4, 0, true),
            new Tile(5, 0, true),
            new Tile(6, 0, true),
            new Tile(7, 0, true)
        ],
        [
            new Tile(0, 1, true),
            new Tile(1, 1, false),
            new Tile(2, 1, true),
            new Tile(3, 1, false),
            new Tile(4, 1, true),
            new Tile(5, 1, false),
            new Tile(6, 1, true),
            new Tile(7, 1, false)
        ],
        [
            new Tile(0, 2, true),
            new Tile(1, 2, false),
            new Tile(2, 2, true),
            new Tile(3, 2, false),
            new Tile(4, 2, true),
            new Tile(5, 2, false),
            new Tile(6, 2, true),
            new Tile(7, 2, false)
        ],
        [
            new Tile(0, 3, true),
            new Tile(1, 3, false),
            new Tile(2, 3, false),
            new Tile(3, 3, false),
            new Tile(4, 3, false),
            new Tile(5, 3, false),
            new Tile(6, 3, false),
            new Tile(7, 3, false)
        ],
        [
            new Tile(0, 4, true),
            new Tile(1, 4, false),
            new Tile(2, 4, false),
            new Tile(3, 4, false),
            new Tile(4, 4, false),
            new Tile(5, 4, false),
            new Tile(6, 4, false),
            new Tile(7, 4, false)
        ],
        [
            new Tile(0, 5, true),
            new Tile(1, 5, true),
            new Tile(2, 5, true),
            new Tile(3, 5, false),
            new Tile(4, 5, false),
            new Tile(5, 5, true),
            new Tile(6, 5, true),
            new Tile(7, 5, true)
        ],
        [
            new Tile(0, 6, false),
            new Tile(1, 6, false),
            new Tile(2, 6, false),
            new Tile(3, 6, false),
            new Tile(4, 6, false),
            new Tile(5, 6, false),
            new Tile(6, 6, false),
            new Tile(7, 6, false)
        ],
        [
            new Tile(0, 7, false),
            new Tile(1, 7, false),
            new Tile(2, 7, false),
            new Tile(3, 7, false),
            new Tile(4, 7, false),
            new Tile(5, 7, false),
            new Tile(6, 7, false),
            new Tile(7, 7, false)
        ],
    ];            
    this.beds = [
        new Bed(2, 1),
        new Bed(4, 1),
        new Bed(6, 1)
    ];      

    this.routes = [];
    this.entry = "";
}


function Bed(x, y) {
    var position1 = [x, y];
    var position2 = [x, y+1];
    this.positions = [position1, position2];
}

Level.prototype.isBlocked = function(target) {
    // target is x and y
    if ((target.x < 0) || (target.y < 0) || (target.x >= this.tilemap[0].length) || (target.y >= this.tilemap.length)) {
        return true;
    }
    var tile = this.tilemap[Math.floor(target.y)][Math.floor(target.x)];
    console.log("checkCollision", Math.floor(target.y), Math.floor(target.x));
    return tile.collides;
}


function Route() {

}


