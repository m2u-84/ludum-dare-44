/**
 * A Menu Handler
 * 
 * Can be used as a wrapper for all buttons on a stage to be able to
 * move the selection pointer around and execute button actions via
 * the keyboard
 */

function MenuHandler() {
  this.buttonList = [];
  this.focusedIndex = undefined;
}

MenuHandler.prototype.addButton = function(button) {
  this.buttonList.push(button);

  if (this.focusedIndex == undefined && !button.disabled) {
    this.focusedIndex = this.buttonList.length - 1;
    button.focus();
  }
}

MenuHandler.prototype.next = function() {
  this.focusedIndex = (this.focusedIndex == (this.buttonList.length - 1)) ? 0 : this.focusedIndex += 1;
  if (this.buttonList[this.focusedIndex].disabled) {
    this.next();
  } else {
    this.switchFocusTo(this.focusedIndex);
  }
}

MenuHandler.prototype.prev = function() {
  this.focusedIndex = (this.focusedIndex == 0) ? (this.buttonList.length - 1) : this.focusedIndex -= 1;
  if (this.buttonList[this.focusedIndex].disabled) {
    this.prev();
  } else {
    this.switchFocusTo(this.focusedIndex);
  }
}

MenuHandler.prototype.switchFocusTo = function(indexOrRefId) {
  this.buttonList.forEach(button => button.blur());
  let index = null;

  if (isNaN(indexOrRefId)) {
    index = this.buttonList.findIndex(button => button.refId == indexOrRefId);
    this.focusedIndex = index
  } else {
    index = indexOrRefId
  }

  if (index !== null) {
    this.buttonList[index].focus();
  } else {
    throw new Error("Couldnt switch focus to button because index could not be determinded");
  } 
}

MenuHandler.prototype.executeFocusedButton = function() {
  this.buttonList[this.focusedIndex].execute();
}
