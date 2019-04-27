

function GameStage() {
  Stage.call(this, "game", 0);
}
inherit(GameStage, Stage);

GameStage.prototype.preload = function() {
};

GameStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
};

GameStage.prototype.update = function(timer) {
  if (this.timeDif == 0) {
    return;
  }
};

GameStage.prototype.onkey = function(event) {
  if (event.key == "Escape") {
    // TODO this.transitionIn("pause", 400);
  }
};
