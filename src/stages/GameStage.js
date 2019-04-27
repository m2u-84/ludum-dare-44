

function GameStage() {
  Stage.call(this, "game", 0);
  this.gameState = new GameState();
}
inherit(GameStage, Stage);

GameStage.prototype.preload = function() {
   this.gameState.init();
   this.mapImage = loader.loadImage("./assets/map.png");
};

GameStage.prototype.render = function(ctx, timer) {
  var cellSize = 24;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.translate(w / 2, h / 2);
  ctx.scale(cellSize, cellSize);
  const offx = Math.round(-this.gameState.doctor.x * 24) / 24;
  const offy = Math.round(-this.gameState.doctor.y * 24) / 24;
  ctx.translate(offx, offy);
  drawImage(ctx, this.mapImage, 0, 0, 0, 1 / cellSize, 1 / cellSize, 0, 0);
  this.gameState.doctor.paint(ctx);
};

GameStage.prototype.update = function(timer) {
  if (this.timeDif == 0) {
    return;
  }
  this.gameState.doctor.update();
};

GameStage.prototype.onkey = function(event) {
  if (event.key == "Escape") {
    // TODO this.transitionIn("pause", 400);
  } else if (event.key == "Enter") {
    this.transitionIn("syringe");
  }
};
