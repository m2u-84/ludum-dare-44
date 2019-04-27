

function GameStage() {
  Stage.call(this, "game", 0);
  this.gameState = new GameState();
}
inherit(GameStage, Stage);

GameStage.prototype.preload = function() {
   // grafik laden
   this.mapImage = loader.loadImage("./assets/test.png");
};

GameStage.prototype.render = function(ctx, timer) {
  ctx.scale(4, 4);
  const w = ctx.canvas.width, h = ctx.canvas.height;
  drawImage(ctx, this.mapImage, 0, 0, 0, 1, 1, 0, 0);
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
  }
};
