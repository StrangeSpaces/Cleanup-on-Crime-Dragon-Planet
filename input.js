var Key = {
  _pressed: {},

  LEFT: [65, 37],
  UP: [38, 87],
  JUMP: [32],
  RIGHT: [68, 39],
  DOWN: [83, 40],
  R: [82, 82],
  P: [80, 88],

  update: function() {
    for (var key in this._pressed) {
      this._pressed[key] += 1;
    }
  },
  
  isDown: function(keyCode) {
    for (var i = keyCode.length - 1; i >= 0; i--) {
        if (this._pressed[keyCode[i]]) return true;
    }
    return false;
  },

  pressed: function(keyCode) {
    for (var i = keyCode.length - 1; i >= 0; i--) {
        if (this._pressed[keyCode[i]] == 1) return true;
    }
    return false;
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = this._pressed[event.keyCode] || 0;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
