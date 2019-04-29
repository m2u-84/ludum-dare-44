

window.onload = () => {

  const canvas = document.getElementById("gameCanvas");
  timer = new Timer();
  loader = new Loader();
  mainFont = new BitmapFont("assets/fontsheet.png", {
    "white": "white", "black": "black", "gray": "gray", "darkgray": "#333", "orange": "#d9913c", "green": "#81bc1b",
    "red": "red", "blue": "#009cff", "money": "#f0c030"
    },
    "abcdefghijklmnopqrstuvwxyz0123456789#$()[]+-?!',. :",
    [5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,3,3,2,2,5,5,4,1,1,2,2,4,3]);
  bigFont = new BitmapFont("assets/bignumbers.png", {"dark": "#5d5d5d"}, "0123456789", [11,6,11,11,10,11,11,11,11,11]);
  keyHandler = new KeyHandler(canvas, [" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "W", "A", "S", "D"]);
  mouseHandler = new MouseHandler(canvas);
  mouse = mouseHandler.mouse;
  stageManager = new StageManager(canvas, timer);
  gameStage = new GameStage();
  stageManager.add(new LoadStage())
              .add(gameStage)
              .add(new PauseStage())
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