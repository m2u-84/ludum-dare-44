
function LoadStage() {
  Stage.call(this, "load", 5);
}
inherit(LoadStage, Stage);

LoadStage.prototype.preload = function() {
  this.pointer = {
    image:  loader.loadAssetImage('pointer.png', 24, 1),
    frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
  }
  this.share('pointer', this.pointer);
}

LoadStage.prototype.render = function(ctx, timer) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const p = Interpolators.cubic3(this.opacity);

    if (p < 1) {
        ctx.translate(0, -(1 - p) * (h + 10));
    }

    // Black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    const percent = Math.round(loader.progress * 100);

    // Progress bar
    ctx.fillStyle = 'white';
    ctx.fillRect(20, h - 35, (w - 160) / 100 * percent, 15)

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(20, h - 35, w - 160, 15);

    // Message
    const alpha = (0.7 + 0.2 * Math.sin(timer.runTime * 0.003));
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'right';
    ctx.font = '16px Arial';
    ctx.fillText(`Loading ${percent} %`, w - 20, h - 22);
};
