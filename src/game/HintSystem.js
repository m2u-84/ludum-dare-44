

function HintSystem() {
  this.allHints = [];
  this.unusedHints = [];
}

HintSystem.prototype.add = function(hint) {
  this.allHints.push(hint);
  this.unusedHints.push(hint);
  this.unusedHints.sort((h1, h2) => h1.priority - h2.priority);
};

HintSystem.prototype.getHint = function(indexRange = 3) {
  if (this.unusedHints.length < 1) {
    return null;
  }
  let currentHints = this.unusedHints.filter(hint => !hint.used);
  const priority = currentHints[0].priority;
  currentHints = this.unusedHints.filter(hint => hint.priority <= priority);
  const index = Math.floor(currentHints.length * Math.random());
  const hint = currentHints[index];
  hint.used = true;
  const unusedIndex = this.unusedHints.findIndex(h => h == hint);
  if (unusedIndex >= 0) {
    this.unusedHints.splice(unusedIndex, 1);
  }
  return hint;
};
