
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

  const menuButton2frames = {
    idle: [9, 10, 11, 12, 13, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    hovered: [14],
    armed: [15]
  }
  const menuButton1frames = {
    idle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
    hovered: [6],
    armed: [7]
  }

  // Load images here
  this.menuImage = loader.loadImage(IMAGES_BASE_PATH + 'menu.png');
  this.menuButtons = loader.loadImage(IMAGES_BASE_PATH + 'menu_buttons.png', 8, 2);
  this.hoverSound = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/key-clicking/key-clicking.mp3'});
  this.backgroundMusic = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/game-starting/menu-song.mp3'});
  this.startingSound = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/game-starting/game-starting.mp3'});
  this.menuButton1 = new Button(192, 205, 95, 21, this.menuButtons, menuButton1frames, function() { stageManager.activeStage.startGame(true) }, undefined, this.hoverSound);
  this.menuButton2 = new Button(192, 229, 95, 21, this.menuButtons, menuButton2frames, function() { stageManager.activeStage.startGame(false) }, undefined, this.hoverSound);

}

StartStage.prototype.startGame = function(isMale) {
  this.backgroundMusic.stop();
  this.startingSound.play();
  if (gameStage.gameState) {
    gameStage.prestart({isMale: isMale});
    this.transitionOut();
  } else {
    this.transitionTo("game", undefined, {isMale: isMale});
  }
};

// StartStage.prototype.prestart = function() {
//   this.backgroundMusic.setVolume(0.8);
//   this.backgroundMusic.loop = true;
//   this.backgroundMusic.play();
// }

StartStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
  }
  // Draw background image
  drawImage(ctx, this.menuImage, 0, 0, 0, 1, 1, 0, 0);

  // Draw Menu Buttons
  this.menuButton1.paint(ctx);
  this.menuButton2.paint(ctx);

  // Credits Text
  const off = (this.time / 12) % 2600;
  const cx = Math.round(w + 100 - off); 
  mainFont.drawText(ctx, this.creditsText, cx, h - 20, "gray", 0);
};

StartStage.prototype.onkey = function(event) {
  if (event.key == "1" || event.key == "2") {
    this.startGame(event.key == "1");
  }
  if (event.key == "m") {
    this.backgroundMusic.setVolume(0.8);
    this.backgroundMusic.loop = true;
    this.backgroundMusic.play();
  }
}
