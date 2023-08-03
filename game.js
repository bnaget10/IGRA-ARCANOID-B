var game = {
    width: 1280,
    height: 720,
    ctx: undefined,
    platform: undefined,
    ball: undefined,
    rows: 3,
    cols: 8,
    running: true,
    score: 0,
    blocks: [],
    sprites: {
        background: undefined,       
        platform: undefined,
        ball: undefined,
        block: undefined,
    },
    init: function() {
        var canvas = document.getElementById("mycanvas");
        this.ctx = canvas.getContext("2d");
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#FFFFFF";


        window.addEventListener("keydown", function(e) {
            if (e.keyCode == 37) {
                game.platform.dx = -game.platform.velocity;
            } else if ( e.keyCode == 39) {
                game.platform.dx = game.platform.velocity;
            } else if ( e.keyCode == 32) {
                game.platform.releaseBall();                
            }
        });
        window.addEventListener("keyup", function(e) {
           game.platform.stop();           
        });
    },
    load: function() {
        for (var key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = "image/" + key + ".png";
        }
    },
    create: function() {
        for ( var row = 0; row < this.rows; row++ ) {
            for ( var col = 0; col < this.cols; col++ ) {
                var block = {
                    x: 140 * col + 80,
                    y: 68 * row + 60,
                    width: 128,
                    height: 48,
                    isAlive: true
                };
                this.blocks.push(block);
            }
        }
    },
    start: function() { 
        this.init();
        this.load(); 
        this.create();      
        this.run();
    },
    render: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y);
        // this.ctx.drawImage(this.sprites.ball, this.ball.width * this.ball.frame, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);

        this.blocks.forEach(function(element) {
            if (element.isAlive) {                
                this.ctx.drawImage(this.sprites.block, element.x, element.y);
            }            
        }, this);
        
        this.ctx.fillText("SCORE: " + this.score, 15, this.height -15);
    },
    update: function() {
        if ( this.ball.collide(this.platform) ) {
            this.ball.bumpPlatform(this.platform);
        }

        if ( this.platform.dx) {
            this.platform.move();
        }
        if ( this.ball.dx || this.ball.dy) {
            this.ball.move();
        }

        this.blocks.forEach(function(element) {
            if ( element.isAlive ) {
                if( this.ball.collide(element) ) {
                    this.ball.bumpBlock(element);
                }
            }           
        }, this);

        this.ball.checkBounds();
    },
    run: function() {
        this.update();
        this.render();

        if ( this.running ) {
            window.requestAnimationFrame(function() {
                game.run();
            });
        }        
    },
    over: function(message) {
        alert(message);
        this.running = false;
        window.location.reload();  
    }
};

game.ball = {
    width: 40,
    height: 40,
    frame: 0, 
    x: 620,
    y: 620,
    dx: 0,
    dy: 0,
    velocity: 4,
    jump: function() {
        this.dy = -this.velocity;
        this.dx = -this.velocity;
        // this.animate();
    },
    // animate: function() {
    //     setInterval(function() {
    //         ++game.ball.frame;

    //         if (game.ball.frame > 3) {
    //             game.ball.frame = 0;
    //         }
    //     }, 100);
        
    // },
    move: function() {
        this.x += this.dx;
        this.y += this.dy;
    },
    collide: function(element) {
        var x = this.x + this.dx;
        var y = this.y + this.dy;

        if ( x + this.width > element.x && x < element.x + element.width && y + this.height > element.y && y < element.y + element.height) {
            return true;
        }
        return false;
    },
    bumpBlock: function(block) {
        this.dy *= -1;
        block.isAlive = false;
        ++game.score;

        if ( game.score >= game.blocks.length ) {
            game.over("You Win! " + " You Score: " + game.score);
        }
    },
    onTheLeftSide: function(platform) {
       return (this.x + this.width / 2) < (platform.x + platform.width / 2)  
    },
    bumpPlatform: function(platform) {
        this.dy = -this.velocity;
        this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
    },
    checkBounds: function() {
        var x = this.x + this.dx;
        var y = this.y + this.dy;

        if ( x < 0) {
            this.x = 0;
            this.dx = this.velocity;
        } else if ( x +this.width > game.width ) {
            this.x = game.width - this.width;
            this.dx = -this.velocity;
        } else if ( y < 0 ) {
            this.y = 0;
            this.dy = this.velocity;
        } else if ( y + this.height > game.height) {            
            game.over("Game Over " + " You Score: " + game.score);
        }

    }
};

game.platform = {    
    x: 540,
    y: 660,
    velocity: 8,
    dx: 0,
    ball: game.ball,
    width: 200,
    height: 48,
    releaseBall: function() {
        if (this.ball) {
            this.ball.jump();
            this.ball = false;
        }
    },
    move: function() {
        this.x += this.dx;

        if ( this.ball) {
            this.ball.x += this.dx;
        }
    },
    stop: function() {
        this.dx = 0;

        if ( this.ball) {
            this.ball.dx = 0;
        }
    }
    
};

window.addEventListener("load", function() {
    game.start();
});