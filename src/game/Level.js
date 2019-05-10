

// define Level class
function Level(rawMap) {

    // use w for wall, b for bed, r for receptionPoint, s for spawnPoint
    // cf. map_raster.png
    let x, y, collide;

    this.rawMap = rawMap.split('\n');

    // used for collision detection
    this.tilemap = new Array(this.rawMap.length).fill(null)
        .map(tile => new Array(this.rawMap[0].length).fill(null));
    this.beds = [];
    this.spawnPoints = [];
    this.spawnPointCar = null;
    this.vanishingPointCar = null;
    this.parkingPointPoliceCar = null;
    this.breakingPointPoliceCar = null;
    this.parkingPointMafiaCar = null;
    this.breakingPointMafiaCar = null;
    this.receptionPoints = [];
    this.facilityManagerWaitPoint = null;
    this.pilePoint = null;
    this.firePoint = null;

    const isTopmostBedTile = function(y, rawMap) {
        let count = 0,
            y0;

        for (y0 = 0; y0 < y; y0++) {
            if (rawMap[y0][x] == 'b') {
                count++;
            }
        }
        return count % 2 == 0;
    };

    for (y = 0; y < this.rawMap.length; y++) {
        for (x = 0; x < this.rawMap[0].length; x++) {
            collide = false;

            switch (this.rawMap[y][x]) {
                case '-':
                    break;

                case 'w':
                    collide = true;
                    break;

                case 's':
                    this.spawnPoints.push({x: x, y: y});
                    break;

                case 'c':
                    this.spawnPointCar = {x: x, y: y};
                    break;

                case 'C':
                    this.vanishingPointCar = {x: x, y: y};
                    break;

                case 'Q':
                    this.breakingPointPoliceCar = {x: x, y: y};
                    break;

                case 'P':
                    this.parkingPointPoliceCar = {x: x, y: y};
                    break;

                case 'N':
                    this.breakingPointMafiaCar = {x: x, y: y};
                    break;

                case 'M':
                    this.parkingPointMafiaCar = {x: x, y: y};
                    break;

                case 'r':
                    this.receptionPoints.push({x: x, y: y});
                    break;

                case 'f':
                    this.facilityManagerWaitPoint = {x: x, y: y};
                    break;

                case 'p':
                    this.pilePoint = {x: x, y: y};
                    break;

                case 'F':
                    this.firePoint = {x: x, y: y};
                    collide = true;
                    break;

                case 'b':
                    collide = true;
                    if (isTopmostBedTile(y, this.rawMap)) {
                        this.beds.push(new Bed(x, y));
                    }
                    break;
            }
            this.tilemap[y][x] = new Tile(x, y, collide);
        }
    }
    this.h = this.tilemap.length;
    this.w = this.tilemap[0].length;
}

Level.pathFindingCount = 0;

Level.prototype.init = function() {
    this.placeBeds();
};

Level.prototype.isBlocked = function(target) {
    // target is x and y
    if ((target.x < 0) || (target.y < 0) || (target.x >= this.w) || (target.y >= this.h)) {
        return true;
    }
    var tile = this.tilemap[Math.floor(target.y)][Math.floor(target.x)];
    return tile.collides;
};

Level.prototype.getBed = function(target) {
    // target is x and y
    if ((target.x < 0) || (target.y < 0) || (target.x >= this.tilemap[0].length) || (target.y >= this.tilemap.length)) {
        return null;
    }
    var tile = this.tilemap[Math.floor(target.y)][Math.floor(target.x)];
    return tile.bed;
};

Level.prototype.placeBeds = function() {
    for (var i = 0; i < this.beds.length; i++) {
        var x1 = this.beds[i].positions[0].x;
        var y1 = this.beds[i].positions[0].y;
        this.tilemap[y1][x1].bed = this.beds[i];
        var x2 = this.beds[i].positions[1].x;
        var y2 = this.beds[i].positions[1].y;
        this.tilemap[y2][x2].bed = this.beds[i];
    }
};

Level.prototype.findPath = function(x1, y1, x2, y2, doShuffle = true) {
    const self = this;
    const directions = [ [0,1], [1,0], [-1,0], [0,-1] ]; // hack: special order for car movement
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    Level.pathFindingCount++;
    const tiles = [];
    addNeighbours(x1, y1);
    let found = false;
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i][0] == x2 && tiles[i][1] == y2) {
            found = true;
            break;
        }
        addNeighbours(tiles[i][0], tiles[i][1], tiles[i][2]);
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

    function addNeighbours(x, y, originalDirection) {
        if (doShuffle) {
            shuffle(directions)
        }
        if (originalDirection) {
            moveToTop(directions, originalDirection);
        }
        for (var d of directions) {
            addNeighbour(x + d[0], y + d[1], x, y, d);
        }
    }

    function addNeighbour(x, y, sx, sy, d) {
        if (!self.isBlocked({x,y}) && self.tilemap[y][x].pathFindingCount !== Level.pathFindingCount) {
            self.tilemap[y][x].pathFindingCount = Level.pathFindingCount;
            self.tilemap[y][x].pathFindingSource = [sx, sy];
            tiles.push([x, y, d]);
        }
    }
};

Level.prototype.computeLengthOfPath = function(path) {

    let pathLength = 0;
    for (let i=0; i < path.length - 1; i++) {
        const currentPoint = path[i];
        const destPoint = path[i+1];
        const dist = vectorLength(currentPoint[0] - destPoint[0], currentPoint[1] - destPoint[1]);
        pathLength += dist;
    }
    return pathLength;
};

Level.prototype.computePathAndLength = function(x1, y1, x2, y2) {

    const path = this.findPath(x1, y1, x2, y2);
    if (path) {
        return this.computeLengthOfPath(path);
    } else {
        return Infinity;
    }
};
