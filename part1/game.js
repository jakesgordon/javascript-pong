/*******************************************************************************************/

if (!Function.prototype.bind) { // backward compatible implementation of ECMA 5th edition method (see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind)
  Function.prototype.bind = function( obj ) {
    var slice = [].slice,
        args  = slice.call(arguments, 1),
        self  = this,
        nop   = function () {},
        bound = function () { return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments))); };
    nop.prototype   = self.prototype;
    bound.prototype = new nop();
    return bound;
  };
}

/*******************************************************************************************/

Game = {

  start: function(id, game, config) {
    return new GameRunner(id, game, config);
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
      isIE:      (key == "ie"),
      isFF:      (key == "firefox"),
      isChrome:  (key == "chrome"),
      isSafari:  (key == "safari"),
      isOpera:   (key == "opera"),
      hasCanvas: (document.createElement('canvas').getContext || (typeof(G_vmlCanvasManager) != 'undefined')),
      hasAudio:  (typeof(Audio) != 'undefined')
    }
  }(),

  extend: function(destination, source) {
    for(var property in source) {
      if (source.hasOwnProperty(property))
        destination[property] = source[property];
    }
    return destination;
  }

};

