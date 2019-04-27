

window.onload = () => {

  const canvas = document.getElementById("gameCanvas");
  timer = new Timer();
  loader = new Loader();
  keyHandler = new KeyHandler(canvas, ["f", "Shift", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);
  mouseHandler = new MouseHandler(canvas);
  mouse = mouseHandler.mouse;
  stageManager = new StageManager(canvas, timer);
  gameStage = new GameStage();
  stageManager.add(new LoadStage())
              .add(gameStage);
  
  // Load stage content
  stageManager.load();
  canvas.focus();
  loader.loadAll().then(() => stageManager.crossfadeToStage("game", 2500, 0));
  handleFrame();
}

function handleFrame() {
  timer.update();
  stageManager.update();
  stageManager.render();
  requestAnimationFrame(handleFrame);
}