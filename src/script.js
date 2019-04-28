

window.onload = () => {

  const canvas = document.getElementById("gameCanvas");
  timer = new Timer();
  loader = new Loader();
  keyHandler = new KeyHandler(canvas, [" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);
  mouseHandler = new MouseHandler(canvas);
  mouse = mouseHandler.mouse;
  stageManager = new StageManager(canvas, timer);
  gameStage = new GameStage();
  stageManager.add(new LoadStage())
              .add(gameStage)
              .add(new ContextMenuStage())
              .add(new SyringeStage())
              .add(new OrganStage());
  
  // Load stage content
  stageManager.load();
  canvas.focus();
  loader.loadAll().then(() => stageManager.crossfadeToStage("game", 800, 0));
  handleFrame();
}

function handleFrame() {
  timer.update();
  stageManager.update();
  stageManager.render();
  requestAnimationFrame(handleFrame);
}