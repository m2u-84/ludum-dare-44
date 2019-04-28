

window.onload = () => {

  const canvas = document.getElementById("gameCanvas");
  timer = new Timer();
  loader = new Loader();
  mainFont = new BitmapFont("assets/fontsheet.png", {
    "white": "white", "black": "black", "gray": "gray", "darkgray": "#333", "orange": "orange", "green": "green",
    "red": "red", "blue": "#4060ff", "money": "#f0c030"
    },
    "abcdefghijklmnopqrstuvwxyz0123456789#$()[]+-?!',. ",
    [5,5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,3,3,2,2,5,5,4,1,1,2,2,5]);
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
};

function handleFrame() {
  timer.update();
  stageManager.update();
  stageManager.render();
  requestAnimationFrame(handleFrame);
}