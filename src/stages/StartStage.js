
function StartStage() {
  Stage.call(this, "start", 4);
  this.creditsText = "Sick Business - We Care a Lot (About Money)   is a contribution to Ludum Dare Game Jam Contest #44. " + 
      "Created by Eduard But, Bjoern Kopiske, Nils Kreutzer, Gordon Lawrenz, Markus Over, Olav Schettler, Jennifer van Veen, " + 
      "and Matthias Wetter, within 72 hours.   Special thanks to ip.labs GmbH for location and coffee.";
}
inherit(StartStage, Stage);

StartStage.prototype.preload = function() {
  const ASSETS_BASE_PATH = './assets/';
  const IMAGES_BASE_PATH = ASSETS_BASE_PATH + 'images/';
  const AUDIO_BASE_PATH = ASSETS_BASE_PATH + 'audio/';

  const menuButton1frames = {
    idle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
    idleSpeed: 75,
    hovered: [6],
    hoveredSpeed: 75,
    armed: [7],
    armedSpeed: 75
  }

  const menuButton2frames = {
    idle: [9, 10, 11, 12, 13, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    idleSpeed: 75,
    hovered: [14],
    hoveredSpeed: 75,
    armed: [15],
    armedSpeed: 75
  }

  // Load images here
  this.menuImage = loader.loadImage(IMAGES_BASE_PATH + 'menu.png');
  this.menuButtons = loader.loadImage(IMAGES_BASE_PATH + 'menu_buttons.png', 8, 2);
  this.hoverSound = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/key-clicking/key-clicking.mp3'});
  this.startingSound = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/game-starting/game-starting.mp3'});
  this.menuButton1 = new Button(this.menuButtons, menuButton1frames, function() { stageManager.activeStage.startGame(true) }, undefined, this.hoverSound);
  this.menuButton2 = new Button(this.menuButtons, menuButton2frames, function() { stageManager.activeStage.startGame(false) }, undefined, this.hoverSound);

}

StartStage.prototype.startGame = function(isMale) {
  this.startingSound.play();
  if (gameStage.gameState) {
    gameStage.prestart({isMale: isMale});
    this.transitionOut();
  } else {
    this.transitionTo("game", undefined, {isMale: isMale});
  }
};

StartStage.prototype.prestart = function() {

}

StartStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }
  // Draw background image
  drawImage(ctx, this.menuImage, 0, 0, 0, 1, 1, 0, 0);

  // Draw Menu Buttons
  this.menuButton1.paint(ctx, 192, 205);
  this.menuButton2.paint(ctx, 192, 229);

  // Credits Text
  const off = (this.time / 12) % 2600;
  const cx = Math.round(w + 100 - off); 
  mainFont.drawText(ctx, this.creditsText, cx, h - 20, "gray", 0);
};

StartStage.prototype.onkey = function(event) {
  if (event.key == "1" || event.key == "2") {
    this.startGame(event.key == "1");
  }
}
