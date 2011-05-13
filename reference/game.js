//=============================================================================
//
// We need some ECMAScript 5 methods but we need to implement them ourselves
// for older browsers (compatibility: http://kangax.github.com/es5-compat-table/)
//
//  Function.bind:        https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
//  Object.create:        http://javascript.crockford.com/prototypal.html
//  Object.extend:        (defacto standard like jquery $.extend or prototype's Object.extend)
//
//  Object.construct:     our own wrapper around Object.create that ALSO calls
//                        an initialize constructor method if one exists
//
//=============================================================================

if (!Function.prototype.bind) {
  Function.prototype.bind = function(obj) {
    var slice = [].slice,
        args  = slice.call(arguments, 1),
        self  = this,
        nop   = function () {},
        bound = function () {
          return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));   
        };
    nop.prototype   = self.prototype;
    bound.prototype = new nop();
    return bound;
  };
}

if (!Object.create) {
  Object.create = function(base) {
    function F() {};
    F.prototype = base;
    return new F();
  }
}

if (!Object.construct) {
  Object.construct = function(base) {
    var instance = Object.create(base);
    if (instance.initialize)
      instance.initialize.apply(instance, [].slice.call(arguments, 1));
    return instance;
  }
}

if (!Object.extend) {
  Object.extend = function(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  };
}

/* NOT READY FOR PRIME TIME
if (!window.requestAnimationFrame) {// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                 window.mozRequestAnimationFrame    || 
                                 window.oRequestAnimationFrame      || 
                                 window.msRequestAnimationFrame     || 
                                 function(callback, element) {
                                   window.setTimeout(callback, 1000 / 60);
                                 }
}
*/

//=============================================================================
// GAME
//=============================================================================

Game = {

  compatible: function() {
    return Object.create &&
           Object.extend &&
           Function.bind &&
           document.addEventListener && // HTML5 standard, all modern browsers that support canvas should also support add/removeEventListener
           Game.ua.hasCanvas
  },

  start: function(id, game, config) {
    if (Game.compatible())
      return Object.construct(Game.Runner, id, game, config);
  },

  ua: function() {
    var ua  = navigator.userAgent.toLowerCase();
    var key =        ((ua.indexOf("opera")   > -1) ? "opera"   : null);
        key = key || ((ua.indexOf("firefox") > -1) ? "firefox" : null);
        key = key || ((ua.indexOf("chrome")  > -1) ? "chrome"  : null);
        key = key || ((ua.indexOf("safari")  > -1) ? "safari"  : null);
        key = key || ((ua.indexOf("msie")    > -1) ? "ie"      : null);

    try {
      var re      = (key == "ie") ? "msie (\\d)" : key + "\\/(\\d\\.\\d)"
      var matches = ua.match(new RegExp(re, "i"));
      var version = matches ? parseFloat(matches[1]) : null;
    } catch (e) {}

    return {
      full:      ua, 
      name:      key + (version ? " " + version.toString() : ""),
      version:   version,
      isFirefox: (key == "firefox"),
      isChrome:  (key == "chrome"),
      isSafari:  (key == "safari"),
      isOpera:   (key == "opera"),
      isIE:      (key == "ie"),
      hasCanvas: (document.createElement('canvas').getContext),
      hasAudio:  (typeof(Audio) != 'undefined')
    }
  }(),

  addEvent: function(obj, type, fn) {
    obj.addEventListener(type, fn, false);
  },

  removeEvent: function(obj, type, fn) {
    obj.removeEventListener(type, fn, false);
  },

  ready: function(fn) {
    Game.addEvent(document, 'DOMContentLoaded', fn);
  },

  createCanvas: function() {
    return document.createElement('canvas');
  },

  createAudio: function(src) {
    try {
      var a = new Audio(src);
      a.volume = 0.1; // lets be real quiet please
      return a;
    } catch (e) {
      return null;
    }
  },

  loadImages: function(sources, callback) { /* load multiple images and callback when ALL have finished loading */
    var images = {};
    var count = sources ? sources.length : 0;
    if (count == 0) {
      callback(images);
    }
    else {
      for(var n = 0 ; n < sources.length ; n++) {
        var source = sources[n];
        var image = document.createElement('img');
        images[source] = image;
        Game.addEvent(image, 'load', function() { if (--count == 0) callback(images); });
        image.src = source;
      }
    }
  },

  random: function(min, max) {
    return (min + (Math.random() * (max - min)));
  },

  timestamp: function() { 
    return new Date().getTime();
  },

  KEY: {
    BACKSPACE: 8,
    TAB:       9,
    RETURN:   13,
    ESC:      27,
    SPACE:    32,
    LEFT:     37,
    UP:       38,
    RIGHT:    39,
    DOWN:     40,
    DELETE:   46,
    HOME:     36,
    END:      35,
    PAGEUP:   33,
    PAGEDOWN: 34,
    INSERT:   45,
    ZERO:     48,
    ONE:      49,
    TWO:      50,
    A:        65,
    L:        76,
    P:        80,
    Q:        81,
    TILDA:    192
  },

  //-----------------------------------------------------------------------------

  Runner: {

    initialize: function(id, game, config) {
      this.fps          = 60;
      this.interval     = 1000.0 / this.fps;
      this.canvas       = document.getElementById(id);
      this.front        = this.canvas;
      this.back         = Game.createCanvas();
      this.back.width   = this.front.width;
      this.back.height  = this.front.height;
      this.front2d      = this.front.getContext('2d');
      this.back2d       = this.back.getContext('2d');
      this.debug        = config.debug || (location.href.indexOf("debug") > 0);
      this.showStats    = this.debug;

      Game.loadImages(game.Images, this.startGame.bind(this, game, config));
    },

    startGame: function(game, customConfig, images) {
      var config = {};                                           // build up config object to pass to game constructor...
      Object.extend(config, game.Defaults ? game.Defaults : {}); // start off with game defaults (if any)
      Object.extend(config, customConfig  ? customConfig  : {}); // extend with customized config (if any)
      config.width  = this.canvas.width;                         // add width
      config.height = this.canvas.height;                        // add height
      config.images = images;                                    // add images
      this.game = Object.construct(game, this, config);          // ... and finally construct the game object
      Game.addEvent(document, 'keydown', this.onkeydown.bind(this));
      Game.addEvent(document, 'keyup',   this.onkeyup.bind(this));
      this.lastFrame = Game.timestamp();
      this.resetStats();
      setInterval(this.loop.bind(this), this.interval);
    },

    loop: function() {
      var start  = Game.timestamp(); this.update((start - this.lastFrame)/1000.0); // send dt as seconds
      var middle = Game.timestamp(); this.draw();
      var end    = Game.timestamp();
      this.updateStats(middle - start, end - middle);
      this.lastFrame = start;
    },

    pause:   function() { this.paused = true;  },
    unpause: function() { this.paused = false; this.lastFrame = Game.timestamp(); }, // avoid sending huge dt values in the next update()

    update: function(dt) {
      if (!this.paused)
        this.game.update(dt);
    },

    draw: function() {
      this.back2d.clearRect(0, 0, this.back.width, this.back.height);
      this.game.draw(this.back2d);
      this.drawStats(this.back2d);
      this.front2d.clearRect(0, 0, this.front.width, this.front.width);
      this.front2d.drawImage(this.back, 0, 0);
    },

    resetStats: function() {
      if (this.showStats) {
        this.stats = {
          count:  0,
          fps:    0,
          update: 0,
          draw:   0, 
          frame:  0  // update + draw
        };
      }
    },

    updateStats: function(update, draw) {
      if (this.showStats) {
        this.stats.update = Math.max(1, update);
        this.stats.draw   = Math.max(1, draw);
        this.stats.frame  = this.stats.update + this.stats.draw;
        this.stats.count  = this.stats.count == this.fps ? 0 : this.stats.count + 1;
        this.stats.fps    = Math.min(this.fps, 1000 / this.stats.frame);
      }
    },

    drawStats: function(ctx) {
      if (this.showStats) {
        ctx.fillText("frame: "  + this.stats.count,         this.back.width - 100, this.back.height - 60);
        ctx.fillText("fps: "    + this.stats.fps,           this.back.width - 100, this.back.height - 50);
        ctx.fillText("update: " + this.stats.update + "ms", this.back.width - 100, this.back.height - 40);
        ctx.fillText("draw: "   + this.stats.draw   + "ms", this.back.width - 100, this.back.height - 30);
      }
    },

    onkeydown: function(ev) { if (this.game.onkeydown) this.game.onkeydown(ev.keyCode); },
    onkeyup:   function(ev) { if (this.game.onkeyup)   this.game.onkeyup(ev.keyCode);   },

    hideCursor: function() { this.canvas.style.cursor = 'none'; },
    showCursor: function() { this.canvas.style.cursor = 'auto'; },

    alert: function(msg) {
      this.pause();
      result = window.alert(msg);
      this.unpause();
      return result;
    },

    confirm: function(msg) {
      this.pause();
      result = window.confirm(msg);
      this.unpause();
      return result;
    }

    //-------------------------------------------------------------------------

  } // Game.Runner
} // Game
