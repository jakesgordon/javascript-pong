//=============================================================================
// PONG
//=============================================================================

Pong = {

  Defaults: {
    width:     640,   // logical canvas width (browser will scale to physical canvas size - which is controlled by @media css queries)
    height:    480,   // logical canvas height (ditto)
    wallWidth: 10,
    balls:     20,
    stats:     true
  },

  //-----------------------------------------------------------------------------

  initialize: function(runner, cfg) {
    this.cfg    = cfg;
    this.runner = runner;
    this.width  = runner.width;
    this.height = runner.height;
    this.court  = Object.construct(Pong.Court,  this);
    this.balls  = this.constructBalls();
    this.runner.start();
  },

  constructBalls: function() {
    var balls = [];
    for(var n = 0 ; n < this.cfg.balls ; n++)
      balls.push(Object.construct(Pong.Ball, this));
    return balls;
  },

  update: function(dt) {
    for(var n = 0 ; n < this.balls.length ; n++)
      this.balls[n].update(dt);
  },

  draw: function(ctx) {
    this.court.draw(ctx);
    for(var n = 0 ; n < this.balls.length; n++)
      this.balls[n].draw(ctx);
  },

  //=============================================================================
  // COURT
  //=============================================================================

  Court: {

    initialize: function(pong) {
      var w  = pong.width;
      var h  = pong.height;
      var ww = pong.cfg.wallWidth;

      this.walls = [];
      this.walls.push({x: 0,    y: 0,      width: w,  height: ww});
      this.walls.push({x: 0,    y: h - ww, width: w,  height: ww});
      this.walls.push({x: 0,    y: 0,      width: ww, height:  h});
      this.walls.push({x: w-ww, y: 0,      width: ww, height:  h});
    },

    draw: function(ctx) {
      ctx.fillStyle = '#F08010';
      for(var n = 0 ; n < this.walls.length ; n++)
        ctx.fillRect(this.walls[n].x, this.walls[n].y, this.walls[n].width, this.walls[n].height);
    }

  },

  //=============================================================================
  // BALL
  //=============================================================================

  Ball: {

    initialize: function(pong) {
      this.pong    = pong;
      this.radius  = Game.random(1, 30);
      this.minX    = pong.cfg.wallWidth + this.radius;
      this.minY    = pong.cfg.wallWidth + this.radius;
      this.maxX    = pong.width  - pong.cfg.wallWidth - this.radius;
      this.maxY    = pong.height - pong.cfg.wallWidth - this.radius;
      this.x       = Game.random(this.minX, this.maxX);
      this.y       = Game.random(this.minY, this.maxY);
      this.dx      = (this.maxX - this.minX) / (Game.random(1, 10) * Game.randomChoice(1, -1));
      this.dy      = (this.maxY - this.minY) / (Game.random(1, 10) * Game.randomChoice(1, -1));
      this.color   = "rgb(" + Math.round(Game.random(0,255)) + ", " + Math.round(Game.random(0,255)) + ", " + Math.round(Game.random(0,255)) + ")";
    },

    update: function(dt, leftPaddle, rightPaddle) {

      this.x = this.x + (this.dx * dt);
      this.y = this.y + (this.dy * dt);

      if ((this.dx > 0) && (this.x > this.maxX)) {
        this.x = this.maxX;
        this.dx = -this.dx;
      }
      else if ((this.dx < 0) && (this.x < this.minX)) {
        this.x = this.minX;
        this.dx = -this.dx;
      }

      if ((this.dy > 0) && (this.y > this.maxY)) {
        this.y = this.maxY;
        this.dy = -this.dy;
      }
      else if ((this.dy < 0) && (this.y < this.minY)) {
        this.y = this.minY;
        this.dy = -this.dy;
      }
    },

    draw: function(ctx) {
      var w = h = this.radius * 2;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
      ctx.fill();
      ctx.closePath();
    }

  }

}; // Pong
