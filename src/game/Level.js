// define Level class
function Level() {
    this.tilemap = [
        [
            new Tile(0, 0, false),
            new Tile(1, 0, true),
            new Tile(2, 0, true),
            new Tile(3, 0, false),
            new Tile(4, 0, true),
            new Tile(5, 0, false),
            new Tile(6, 0, false),
            new Tile(7, 0, false),
        ],
        [
            new Tile(0, 1, false),
            new Tile(1, 1, true),
            new Tile(2, 1, true),
            new Tile(3, 1, false),
            new Tile(4, 1, true),
            new Tile(5, 1, false),
            new Tile(6, 1, true),
            new Tile(7, 1, true),
        ],
        [
            new Tile(0, 2, false),
            new Tile(1, 2, true),
            new Tile(2, 2, false),
            new Tile(3, 2, false),
            new Tile(4, 2, false),
            new Tile(5, 2, false),
            new Tile(6, 2, false),
            new Tile(7, 2, false),
        ],
        [
            new Tile(0, 3, false),
            new Tile(1, 3, true),
            new Tile(2, 3, false),
            new Tile(3, 3, true),
            new Tile(4, 3, false),
            new Tile(5, 3, true),
            new Tile(6, 3, false),
            new Tile(7, 3, true),
        ],
        [
            new Tile(0, 4, false),
            new Tile(1, 4, true),
            new Tile(2, 4, false),
            new Tile(3, 4, true),
            new Tile(4, 4, false),
            new Tile(5, 4, true),
            new Tile(6, 4, false),
            new Tile(7, 4, true),
        ],
        [
            new Tile(0, 5, false),
            new Tile(1, 5, true),
            new Tile(2, 5, true),
            new Tile(3, 5, false),
            new Tile(4, 5, true),
            new Tile(5, 5, true),
            new Tile(6, 5, true),
            new Tile(7, 5, true),
        ],
        [
            new Tile(0, 6, false),
            new Tile(1, 6, false),
            new Tile(2, 6, false),
            new Tile(3, 6, false),
            new Tile(4, 6, false),
            new Tile(5, 6, false),
            new Tile(6, 6, false),
            new Tile(7, 6, false),
        ],
    ];
        
    this.beds = [
        new Bed(2, 0, false)
        new Bed(4, 0, false)
        new Bed(6, 1, true)
        new Bed(3, 3, false)
        new Bed(5, 3, false)
        new Bed(7, 3, false)
    ];

    this.routes = [];
    this.entry = "";
}

Level.prototype.generateTilemap = function () {
    // start with empty tilemap
    var tilemap = [];
    
}


function Tile(x, y, collide) {
    this.position = [x, y];
    this.collides = collide;
}





function Bed(x, y, orientation) {

}



function Route() {

}


