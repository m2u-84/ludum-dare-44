

window.onload = () => {

  const canvas = document.getElementById("gameCanvas");
  timer = new Timer();
  loader = new Loader();
  keyHandler = new KeyHandler(canvas, ["f", "Shift"]);
  mouseHandler = new MouseHandler(canvas);
  mouse = mouseHandler.mouse;
  stageManager = new StageManager(canvas, timer);
  /* stageManager.add(new LoadStage())
              .add(new StartStage())
              .add(new MainStage())
              .add(new PauseStage()); */
  
  // Load stage content
  stageManager.load();
  canvas.focus();
  loader.loadAll(); //.then(() => stageManager.crossfadeToStage("start", 2500, 0));
  handleFrame();
}

function handleFrame() {
  timer.update();
  stageManager.update();
  stageManager.render();
  requestAnimationFrame(handleFrame);
}