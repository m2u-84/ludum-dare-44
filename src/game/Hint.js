

function Hint(text) {
  this.rawText = text;
  this.text = text;
  this.lines = this.text.split("\n");
}

Hint.prototype.getText = function() {
  return this.text;
};

Hint.prototype.getLines = function() {
  return this.lines;
};
