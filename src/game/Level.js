var tilemap = {


};


// define Level class
function Level() {
    this.tilemap = tilemap;
    this.beds = [];
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


