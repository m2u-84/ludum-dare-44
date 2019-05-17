
function LevelSelectStage() {
  Stage.call(this, "levelSelect", 3);
}
inherit(LevelSelectStage, Stage);

LevelSelectStage.prototype.preload = function() {
  // Load images here
  this.bgImage = loader.loadAssetImage('level_select_stage.png');
  this.scoreIcon = loader.loadAssetImage('levelscore.png', 2, 1);
  this.goalPanel = loader.loadAssetImage('level_goal_panel.png');
  this.levelSelectButtonImage = loader.loadAssetImage('level_select_button.png', 4, 2);
  this.hoverSound = loader.loadAssetAudio({src: 'sounds/key-clicking/key-clicking.mp3'});
  this.startingSound = loader.loadAssetAudio({src: 'sounds/game-starting/game-starting.mp3'});
  this.levels = Object.keys(levels).map(key => levels[key]);
  this.levelThumbImages = this.levels.map(level => loader.loadAssetImage(level.thumb));
  this.drawSettings = {
    x: 62,
    y: 90,
    space: 10,
    textMargin: 10
  }

  const levelButtonFrames = {
    idle: [0, 1, 2, 3, 2, 1],
    idleSpeed: 175,
    hovered: [4, 5, 6, 5],
    hoveredSpeed: 150,
    armed: [7],
    armedSpeed: 75
  }

  this.levelButtons = this.levels.map(level => new Button(this.levelSelectButtonImage, levelButtonFrames, () => this.startGame(level.num), this, undefined, this.hoverSound));
  
  this.menu = new MenuHandler();
  this.levelButtons.forEach(button => {
    this.menu.addButton(button);
  })

}

LevelSelectStage.prototype.startGame = function(level) {
  this.startingSound.play();
  if (gameStage.gameState) {
    gameStage.prestart({level: level, isMale: level == 1});
    this.transitionOut();
  } else {
    this.transitionTo("game", undefined, {level: level, isMale: level == 1});
  }
};

LevelSelectStage.prototype.prestart = function() {
}

LevelSelectStage.prototype.render = function(ctx, timer) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const p = Interpolators.cubic3(this.opacity);
  if (p < 1) {
    ctx.translate(0, -(1 - p) * (h + 10));
    // Draw transition shadow
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, h*p, w, 300);
  }

  // Draw background image
  drawImage(ctx, this.bgImage, 0, 0, 0, 1, 1, 0, 0);

  // Iterate over available levels and draw them
  this.levels.forEach((level, i) => {

    const baseX = this.drawSettings.x + (this.levelThumbImages[i].width * i) + (this.drawSettings.space * i);
    const baseY = this.drawSettings.y;

    // Draw level thumbnail
    drawImage(ctx, this.levelThumbImages[i], baseX, baseY, 0, 1, 1, 0, 0);

    // Draw Highscore
    drawFrame(ctx, this.scoreIcon, gameStage.getHighScore(level.num) ? 0 : 1, baseX, (baseY - 24), 0, 1, 1, 0, 0);
    mainFont.drawText(ctx, gameStage.getHighScore(level.num) ? gameStage.getHighScore(level.num) +' points' : 'no highscore', (baseX + 25), (baseY - 17), gameStage.getHighScore(level.num) ? 'green' : 'gray' , 0);
  
    // Draw Button
    this.levelButtons[i].paint(ctx, (baseX-4), (baseY-4));

    // Draw Win / Lose Conditions whern hovering the level
    const panelBaseY = baseY + this.levelThumbImages[i].height + 10;
    let addedPanelY = 7;

    if (this.levelButtons[i].hovered) {
      drawImage(ctx, this.goalPanel, baseX, panelBaseY, 0, 1, 1, 0, 0);

      // Iterate over static game over conditions
      Object.keys(level.gameOver).forEach((key, index) => {
        mainFont.drawText(ctx, level.gameOver[key].text, baseX + this.drawSettings.textMargin, panelBaseY + addedPanelY, index == 0 ? 'green' : 'red', 0);

        if (index === 0) addedPanelY += 24
        else addedPanelY += 15
      })

      // Add dynamic game over conditions
      if (level.params.mafia.enabled) {
        mainFont.drawText(ctx, 'dont miss a payment', baseX + this.drawSettings.textMargin, panelBaseY + addedPanelY, 'red', 0);
        addedPanelY += 15;
      }
      if (level.params.police.enabled) {
        mainFont.drawText(ctx, 'Beware of the police', baseX + this.drawSettings.textMargin, panelBaseY + addedPanelY, 'red', 0);
        addedPanelY += 15;
      }
    
    }
  })
};

LevelSelectStage.prototype.onkey = function(event) {
  if (["ArrowLeft", "a"].indexOf(event.key) >= 0) {
    this.menu.prev();
  }
  if (["ArrowRight", "d"].indexOf(event.key) >= 0) {
    this.menu.next();
  }
  if (["Enter"].indexOf(event.key) >= 0) {
    this.menu.executeFocusedButton();
  }
};