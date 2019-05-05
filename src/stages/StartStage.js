
function StartStage() {
  Stage.call(this, "start", 4);
  this.creditsText = "Sick Business - We Care a Lot (About Money)   is a contribution to Ludum Dare Game Jam Contest #44. " + 
      "Created by Eduard But, Bjoern Kopiske, Nils Kreutzer, Gordon Lawrenz, Markus Over, Olav Schettler, Jennifer van Veen, " + 
      "and Matthias Wetter, within 72 hours.   Special thanks to ip.labs GmbH for location and coffee.";
}
inherit(StartStage, Stage);

StartStage.prototype.preload = function() {
  // Load images here
  this.menuImage = loader.loadImage("./assets/images/menu.png");
}

StartStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }

  drawImage(ctx, this.menuImage, 0, 0, 0, 1, 1, 0, 0);

  // Credits Text
  const off = (this.time / 12) % 2600;
  const cx = Math.round(w + 100 - off); 
  mainFont.drawText(ctx, this.creditsText, cx, h - 20, "gray", 0);
};

StartStage.prototype.onkey = function(event) {
  if (event.key == "1" || event.key == "2") {
    if (gameStage.gameState) {
      gameStage.prestart({isMale: event.key == "1"});
      this.transitionOut();
    } else {
      this.transitionTo("game", undefined, {isMale: event.key == "1"});
    }
  }
}