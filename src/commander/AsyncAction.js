
module.exports = function (actionHandler) {
  "use strict";

// no support for async in commander.js
  let waitOver = false;
  function wait() {
    if (!waitOver) {
      setTimeout(wait, 100);
    }
  }
  wait();

  function done() {
    waitOver = true;
  }

  return function() {
    const self = this;
    const args = Array.prototype.slice.call(arguments, 0);
    args.push(done);
    actionHandler.apply(self, args);
  }

};