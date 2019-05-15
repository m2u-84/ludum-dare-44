

function HintSystem() {
  this.allHints = [];
  this.unusedHints = [];
}

HintSystem.prototype.add = function(hint) {
  this.allHints.push(hint);
  this.unusedHints.push(hint);
};

HintSystem.prototype.getHint = function(indexRange = 3) {
  if (this.unusedHints.length < 1) {
    return null;
  }
  const maxIndex = Math.min(indexRange, this.unusedHints.length);
  const index = Math.floor(maxIndex * Math.random());
  const hint = this.unusedHints.splice(index, 1);
  return hint[0];
};
