
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

  // Load images here
  this.menuImage = loader.loadImage(IMAGES_BASE_PATH + 'menu.png');
  this.menuButtons = loader.loadImage(IMAGES_BASE_PATH + 'menu_buttons.png', 8, 2);
  this.clickSound = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/key-clicking/key-clicking.mp3'});
  this.backgroundMusic = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/game-starting/menu-song.mp3'});
  this.startingSound = loader.loadAudio({src: AUDIO_BASE_PATH + 'sounds/game-starting/game-starting.mp3'});

  this.menuButton1 = {
    x: 192,
    y: 205,
    w: 95,
    h: 21,
    frames: {
      idle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
      hovered: [6],
      armed: [7]
    },
    frame: 0,
    hovered: false,
    armed: false
  }
  this.menuButton2 = {
    x: 192,
    y: 229,
    w: 95,
    h: 21,
    frames: {
      idle: [9, 10, 11, 12, 13, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      hovered: [14],
      armed: [15]
    },
    frame: 0,
    hovered: false,
    armed: false
  }
}

function isOverMenuButton(menuButton) {
  return (
    mouseHandler.mouse.canvasX >= menuButton.x &&
    mouseHandler.mouse.canvasX < (menuButton.x + menuButton.w) &&
    mouseHandler.mouse.canvasY >= menuButton.y &&
    mouseHandler.mouse.canvasY < (menuButton.y + menuButton.h)
  );
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

  // Draw Menu Buttons and logic
  // todo: Create a proper Button class that handles all the mouseHandler logic
  if (this.menuButton1.hovered && this.menuButton1.armed && !mouseHandler.mouse.click) {
    this.startGame(true);
    this.menuButton1.hovered = false;
    this.menuButton1.armed = false;
  } else if (isOverMenuButton(this.menuButton1) && this.menuButton1.hovered && mouseHandler.mouse.click) {
    this.menuButton1.armed = true;
    this.menuButton1.frame = getArrayFrame(timer.gameTime / 75, this.menuButton1.frames.armed);
  } else if (isOverMenuButton(this.menuButton1) && !mouseHandler.mouse.click && !this.menuButton1.hovered) {
    this.menuButton1.hovered = true;
    this.clickSound.play();
    this.menuButton1.frame = getArrayFrame(timer.gameTime / 75, this.menuButton1.frames.hovered);
  } else if (!isOverMenuButton(this.menuButton1)) {
    this.menuButton1.hovered = false;
    this.menuButton1.armed = false;
    this.menuButton1.frame = getArrayFrame(timer.gameTime / 75, this.menuButton1.frames.idle);
  }

  if (this.menuButton2.hovered && this.menuButton2.armed && !mouseHandler.mouse.click) {
    this.startGame(false);
    this.menuButton2.hovered = false;
    this.menuButton2.armed = false;
  } else if (isOverMenuButton(this.menuButton2) && this.menuButton2.hovered && mouseHandler.mouse.click) {
    this.menuButton2.armed = true;
    this.menuButton2.frame = getArrayFrame(timer.gameTime / 75, this.menuButton2.frames.armed);
  } else if (isOverMenuButton(this.menuButton2) && !mouseHandler.mouse.click && !this.menuButton2.hovered) {
    this.menuButton2.hovered = true;
    this.clickSound.play();
    this.menuButton2.frame = getArrayFrame(timer.gameTime / 75, this.menuButton2.frames.hovered);
  } else if (!isOverMenuButton(this.menuButton2)) {
    this.menuButton2.hovered = false;
    this.menuButton2.armed = false;
    this.menuButton2.frame = getArrayFrame(timer.gameTime / 75, this.menuButton2.frames.idle);
  }
  drawFrame(ctx, this.menuButtons, this.menuButton1.frame, this.menuButton1.x, this.menuButton1.y, 0, 1, 1, 0, 0);
  drawFrame(ctx, this.menuButtons, this.menuButton2.frame, this.menuButton2.x, this.menuButton2.y, 0, 1, 1, 0, 0);

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
