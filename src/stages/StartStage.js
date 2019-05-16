
function StartStage() {
  Stage.call(this, "start", 4);
  this.creditsText = "Sick Business - We Care a Lot (About Money)   is a contribution to Ludum Dare Game Jam Contest #44. " + 
      "Created by Eduard But, Bjoern Kopiske, Nils Kreutzer, Gordon Lawrenz, Markus Over, Olav Schettler, Jennifer van Veen, " + 
      "and Matthias Wetter, within 72 hours.   Special thanks to ip.labs GmbH for location and coffee.";
}
inherit(StartStage, Stage);

StartStage.prototype.preload = function() {
  const menuButton1frames = {
    idle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
    idleSpeed: 75,
    hovered: [6],
    hoveredSpeed: 75,
    armed: [7],
    armedSpeed: 75
  }

  // Load images here
  this.menuImage = loader.loadAssetImage('menu.png');
  this.menuButtonImage = loader.loadAssetImage('menu_buttons.png', 8, 3);
  this.hoverSound = loader.loadAssetAudio({src: 'sounds/key-clicking/key-clicking.mp3'});
  this.startingSound = loader.loadAssetAudio({src: 'sounds/game-starting/game-starting.mp3'});
  this.menuButton = new Button(this.menuButtonImage, menuButton1frames, () => stageManager.crossfadeToStage("levelSelect", 800, 0),
      this, this.startingSound, this.hoverSound);
}

StartStage.prototype.prestart = function() {

}

StartStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
    
    // Draw transition shadow
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, h*p, w, 300);
  }

  // Draw background image
  drawImage(ctx, this.menuImage, 0, 0, 0, 1, 1, 0, 0);

  // Draw Menu Buttons
  this.menuButton.paint(ctx, 192, 230);

  // Credits Text
  const off = (this.time / 12) % 2600;
  const cx = Math.round(w + 100 - off);
  mainFont.drawText(ctx, this.creditsText, cx, h - 20, "gray", 0);
};

StartStage.prototype.onkey = function(event) {
  if (event.key == "1" || event.key == "2") {
    stageManager.crossfadeToStage("levelSelect", 800, 0);
    // this.transitionTo("levelSelect", undefined, undefined)
  }
}
