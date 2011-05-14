//=============================================================================
// PONG
//=============================================================================

Pong = {

  Defaults: {
    width:  640,   // logical canvas width (browser will scale to physical canvas size - which is controlled by @media css queries)
    height: 480,   // logical canvas height (ditto)
    stats: true,   // tell Game.Runner to show stats
  },

  //-----------------------------------------------------------------------------

  initialize: function(runner, cfg) {
    this.cfg         = cfg;
    this.runner      = runner;
    this.width       = runner.width;
    this.height      = runner.height;
    this.time        = 0;
    this.runner.start();
  },

  update: function(dt) {
    this.time = this.time + dt;
  },

  draw: function(ctx) {
    ctx.strokeStyle = 'white'
    ctx.strokeRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#F08010'
    ctx.font = '144px sans-serif'

    var count = Math.round(this.time).toString();
    var dim   = ctx.measureText(count); dim.height = dim.height || 100; // measureText only returns width!
    var x     = (this.width - dim.width) / 2;
    var y     = (this.height - dim.height) / 2;

    ctx.fillText(count, x, y + dim.height);
  }

}; // Pong
