

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
    this.h = this.tilemap.length;
    this.w = this.tilemap[0].length;

    console.log("TILES", this.tilemap);
    console.log("BEDS", this.beds);

    this.routes = [];
    this.entry = "";
}

Level.pathFindingCount = 0;

Level.prototype.init = function() {
    this.placeBeds();
}

Level.prototype.isBlocked = function(target) {
    // target is x and y
    if ((target.x < 0) || (target.y < 0) || (target.x >= this.w) || (target.y >= this.h)) {
        return true;
    }
    var tile = this.tilemap[Math.floor(target.y)][Math.floor(target.x)];
    return tile.collides;
}

Level.prototype.getBed = function(target) {
    // target is x and y
    if ((target.x < 0) || (target.y < 0) || (target.x >= this.tilemap[0].length) || (target.y >= this.tilemap.length)) {
        return true;
    }
    var tile = this.tilemap[Math.floor(target.y)][Math.floor(target.x)];
    return tile.bed;
}

Level.prototype.placeBeds = function() {
    for (var i = 0; i < this.beds.length; i++) {
        var x1 = this.beds[i].positions[0][0];
        var y1 = this.beds[i].positions[0][1];
        this.tilemap[y1][x1].bed = this.beds[i];
        var x2 = this.beds[i].positions[1][0];
        var y2 = this.beds[i].positions[1][1];
        this.tilemap[y2][x2].bed = this.beds[i];
    }
}

Level.prototype.findPath = function(x1, y1, x2, y2) {
    const self = this;
    Level.pathFindingCount++;
    const tiles = [];
    addNeighbours(x1, y1);
    let found = false;
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i][0] == x2 && tiles[i][1] == y2) {
            found = true;
            break;
        }
        addNeighbours(tiles[i][0], tiles[i][1]);
    }
    if (found) {
        // Reconstruct path by backtracking from goal
        const route = [[x2, y2]];
        while (x2 != x1 || y2 != y1) {
            const tile = this.tilemap[y2][x2];
            x2 = tile.pathFindingSource[0];
            y2 = tile.pathFindingSource[1];
            route.unshift([x2, y2]);
        }
        return route;
    } else {
        return null;
    }

    function addNeighbours(x, y) {
        addNeighbour(x - 1, y, x, y);
        addNeighbour(x + 1, y, x, y);
        addNeighbour(x, y - 1, x, y);
        addNeighbour(x, y + 1, x, y);
    }

    function addNeighbour(x, y, sx, sy) {
        if (!self.isBlocked({x,y}) && self.tilemap[y][x].pathFindingCount !== Level.pathFindingCount) {
            self.tilemap[y][x].pathFindingCount = Level.pathFindingCount;
            self.tilemap[y][x].pathFindingSource = [sx, sy];
            tiles.push([x, y]);
        }
    }
};

function Route() {

}


