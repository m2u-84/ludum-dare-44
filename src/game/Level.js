

// define Level class
function Level() {

    var rawMap = 
          'wwwwwwww\n'
        + 'w-b-b-b-\n'
        + 'w-b-b-b-\n'
        + 'w-------\n'
        + 'w-------\n'
        + 'www--www\n'
        + '--------\n'
        + '--------',
        x, y, y0, count;

    rawMap = rawMap.split('\n');

    console.log("RAW", rawMap);

    // used for collision detection
    this.tilemap = new Array(rawMap.length).fill(null)
        .map(tile => new Array(rawMap[0].length).fill(null));
    this.beds = [];

    for (y = 0; y < rawMap.length; y++) {
        for (x = 0; x < rawMap[0].length; x++) {
            switch (rawMap[y][x]) {
                case '-':
                    this.tilemap[y][x] = new Tile(x, y, false);
                    break;

                case 'w':
                    this.tilemap[y][x] = new Tile(x, y, true);
                    break;

                case 'b':
                    this.tilemap[y][x] = new Tile(x, y, true);

                    count = 0;
                    for (y0 = 0; y0 < y; y0++) {
                        if (rawMap[y0][x] == 'b') {
                            count++;
                        }
                    }

                    // a new bed starts on even counts
                    if (count % 2 == 0) {
                        this.beds.push(new Bed(x, y));
                    }
                    break;
            }
        }
    }

    console.log("TILES", this.tilemap);
    console.log("BEDS", this.beds);

    this.routes = [];
    this.entry = "";
}

Level.prototype.init = function() {
    this.placeBeds();
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

Level.prototype.placeBeds = function() {
    /*for (var i = 0; i < this.beds.length; i++) {
        var x = this.beds[i].position[0];
        
    }*/
}

function Route() {

}


