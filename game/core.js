var Player = require("./player.js");
var Paddle = require("./paddle.js");
var Ball = require("./ball.js");

var Pong = function(){
    var obj = this;
    obj.gameover = false;
    
    obj.players = [];
    obj.balls = [];
    obj.score = [];
    obj.canvas = {width: 750, height: 750};
    obj.ny; 
    obj.nx;
    obj.lastpaddlehit;
    obj.running = false;
    
    obj.addBall = function(){
        obj.balls.push(new Ball(obj));
    }();
    
    obj.addPlayer = function(ai, socketid){
        if(ai){
            obj.players.push(new Player(obj.players.length, new Paddle(obj), true));
        }
        else{
            var nplayer = new Player(obj.players.length, new Paddle(obj), false);
            nplayer.socketid = socketid;
            
            obj.players.push(nplayer);
        }
    };
    
    obj.getNewData = function(){
        var ballcors = obj.balls[0].update();
        var playercors = [];
        obj.players.forEach(function(player){
            playercors.push(player.paddle.update());
        });
        
        return {
            ball: ballcors,
            players: playercors
        };
    };
    
    var loop = function(){
        
        var cors = obj.getNewData();
        if(obj.onNewCoordinatesFn !== undefined)
            obj.onNewCoordinatesFn(cors);
        
        if(obj.running){
            setTimeout(function(){
                loop();
            }, 1000/40);
        }
    };
    
    obj.start = function(){        
        obj.running = true;
        loop();
    };
    
    obj.onNewCoordinates = function(callback){
        obj.onNewCoordinatesFn = callback;
    };
};

module.exports = Pong;