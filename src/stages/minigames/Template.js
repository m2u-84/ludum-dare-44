
function TemplateStage() {
  MinigameStage.call(this, "gameName");
  this.helpText = "If required, this explains how to play the game during training mode";
}
inherit(TemplateStage, MinigameStage);

TemplateStage.prototype.preload = function() {
  MinigameStage.prototype.preload.call(this);
  // load graphics here
  // this.image = loader.loadAssetImage('…');
};

TemplateStage.prototype.prestart = function(payload) {
  MinigameStage.prototype.prestart.call(this, payload);
  this.treatment = gameStage.gameState.treatments.WhicheverTreatmentItIs; // define the minigame's treatment here
  // Reset minigame logics here
};

TemplateStage.prototype.update = function(timer) {
  MinigameStage.prototype.update.call(this, timer);
  if (this.paused) { return; }
  // If minigame is won or lost:
  if (someCondition) {
    success = someEvaluation;
    this.close(success);
  }
};

TemplateStage.prototype.render = function(ctx, timer) {
  // MinigameStage handles transitions, background, clipping
  MinigameStage.prototype.render.call(this, ctx, timer);
  // Render own stuff here, everything is clipped in area [0, 0, this.w, this.h]
  // ...
  // MinigameStage handles overlay stuff / UI
  MinigameStage.prototype.renderOnTop.call(this, ctx, timer);
};
