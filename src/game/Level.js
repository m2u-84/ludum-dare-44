var level = {


};


// define Level class
function Level() {
    this.tilemap = [];
    this.beds = [];
    this.routes = [];
    this.entry = "";
}


Level.prototype.generateTilemap = function () {
    // parse level.json
    //var parsedJson = JSON.parse(level);
    // start with empty tilemap
    var tilemap = [];
    
}


function Tile(x, y, collide) {
    this.position = [x, y];
    this.collides = collide;
}





function Bed() {

}



function Route() {

}


