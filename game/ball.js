var Ball = function(Base){
    var obj = this; //catch this
    obj.vx = (Math.random() < .5) ? 8 : -8;
    obj.vy = (Math.random() < .5) ? 7 : -7;
    obj.radius = 8;
    obj.x = Base.canvas.width / 2;
    obj.y = Base.canvas.height / 2;
    obj.freewalls = {l: true, t: true, r: true, b: true};
    
    // Check which walls are free from players
    Base.players.forEach(function(player){
        if(player.index == 0)
            obj.freewalls.l = false;
        if(player.index == 1)
            obj.freewalls.r = false;
        if(player.index == 2)
            obj.freewalls.t = false;
        if(player.index == 3)
            obj.freewalls.b = false;
    });
    
    /*
     * Update the ball's coordinates every step
     * @return Object coordinates
     */
    obj.update = function(){
        // Check for collisions on every draw if there are only two players
        obj.checkWallCollision();
        
        // Update the coordinates
        obj.x += obj.vx;
        obj.y += obj.vy;
        
        return {
            x: Math.round(obj.x),
            y: Math.round(obj.y)
        }
    };
    
    /*
     * Check for collision with the walls
     */
    obj.checkWallCollision = function(){
        // Check top wall
        if((obj.y - obj.radius < 0 && (obj.vy) < 0 && obj.freewalls.t) || (obj.y + obj.radius > Base.canvas.height && (obj.vy) > 0 && obj.freewalls.b))
            obj.vy = -obj.vy;
        
        if((obj.x - obj.radius < 0 && (obj.vx) < 0 && obj.freewalls.l) || (obj.x + obj.radius > Base.canvas.width && (obj.vx) > 0 && obj.freewalls.r))
            obj.vx = -obj.vx;
        
        // Game over checks
        if((obj.y - obj.radius < 0 && (obj.vy) < 0 && !obj.freewalls.t) || (obj.y + obj.radius > Base.canvas.height && (obj.vy) && !obj.freewalls.b))
            Base.running = false;
                
        if((obj.x - obj.radius < 0 && (obj.vx) < 0 && !obj.freewalls.l) || (obj.x + obj.radius > Base.canvas.width && (obj.vx) > 0 && !obj.freewalls.r))
            Base.running = false;
        
        
    };
};


module.exports = Ball;