// sample tilemap
var tilemap = {


};

// define Level class
function Level() {
    this.tilemap = tilemap;
    this.beds = [];
    this.routes = [];
    this.entry = "";
}





function Bed(x, y, isHorizontal) {
    var position1 = [x, y];
    var position2;
    if (isHorizontal) {
        position2 = [x+1, y];
    } else {
        position2 = [x, y+1];
    }
    this.positions = [position1, position2];
}

Bed.prototype.collides = function() {

}


function Route() {

}


