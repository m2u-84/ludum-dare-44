

function Hint(text, priority) {
  this.rawText = text;
  this.text = text;
  this.lines = this.text.split("\n");
  this.priority = priority;
  this.used = false;
}

Hint.prototype.getText = function() {
  return this.text;
};

Hint.prototype.getLines = function() {
  return this.lines;
};
