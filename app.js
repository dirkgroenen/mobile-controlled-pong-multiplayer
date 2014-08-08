// Setup and configure the server
var express = require('express'),
    http = require("http"),
    app = express(),
    UUID = require('node-uuid'),
    server_port = 80;

// Setup public dir for the http server
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app).listen(server_port, function(){
    console.log('Express server listening on port ' + server_port);
});

var io = require('socket.io').listen(server);

/* Require game file */
var GameCore = require("./game/core.js");

/* Setup the room object */
var clients = [];
var rooms = [];
var Room = function(desktopSocket, roomID){
    this.desktopSockets = [];
    this.mobileSockets = [];
    this.roomID = roomID;
    this.game = null;
    
    /* Add the first given desktopSocket to the array */
    this.desktopSockets.push(desktopSocket);
};

io.sockets.on("connection", function(socket){
    
    // Desktop wants to connect and a list of the rooms
    socket.on("connect desktop", function(fn){
        // Create a new UUID for the socket
        socket.userid = UUID();
        
        // Add to overall socket list 
        clients.push(socket);
        
        fn({
            uuid: socket.userid
        });
        
        sendNewRoomlist();
    });
    
    socket.on("create room", function(fn){
        // Add a new room
        var newroom = new Room(socket, Math.round(Math.random() * 1000));
        
        var game = new GameCore();
        newroom.game = game;
        
        rooms.push(newroom);
        socket.roomindex = rooms.length - 1;
        
        fn({
            roomid: newroom.roomID
        });
       
        sendNewRoomlist();
        
    });
    
    socket.on("join room", function(roomID, fn){
        var roomindex = null;
        
        // Get the room from the array
        for(var i = 0; i < rooms.length; i++){
            if(roomID == rooms[i].roomID){
                roomindex = i;
            }
        }
        
        // If we have found a room we add the user to the room and return that he has joined the room
        if(roomindex !== null){
            var room = rooms[roomindex];
            socket.roomindex = roomindex;

            if(room.desktopSockets.length < 4){
                room.desktopSockets.push(socket);
                
                fn({
                    joined: true
                });
            }
            else{
                fn({
                    joined: false,
                    error: "Room full"
                });
            }
        }
    });
    
    socket.on("connect mobile", function(roomID, fn){
        var roomindex = null;
        
        // Get the room from the array
        for(var i = 0; i < rooms.length; i++){
            
            if(roomID == rooms[i].roomID){
                roomindex = i;
            }
        }

        // If we have found a room we add the user to the room and return that he has joined the room
        if(roomindex !== null){
            var room = rooms[roomindex];
            socket.roomindex = roomindex;
            
            if(room.mobileSockets.length < 4){
                room.mobileSockets.push(socket);
                
                room.game.addPlayer(false, 0);
                socket.playerindex = room.game.players.length - 1;
                
                fn({
                    joined: true
                });
                
                sendPlayerList(room);
            }
            else{
                fn({
                    joined: false,
                    error: "Room full"
                });
            }
        }
        else{
            fn({
                joined: false,
                error: "Room doesn't exist"
            });
        }
    });
    
    socket.on("start game", function(fn){
        var room = rooms[socket.roomindex];
        var game = room.game; 
        
        console.log(game.players.length);
        
        for(var x = game.players.length; x < 4; x++){
            console.log(x);
            game.addPlayer(true);
        }
        
        console.log(game.players);
        
        room.desktopSockets.forEach(function(desktopSocket){
            desktopSocket.emit("game started");
        });
        
        // Attach listener for new game coordinates
        game.onNewCoordinates(function(gamedata){
            room.desktopSockets.forEach(function(desktopSocket){
                desktopSocket.emit("update game", gamedata);
            });
        });
        
        game.start();
        
        // Add game instace to room
        room.game = game;
        
        fn();
    });
    
    // Update movement
    socket.on("update movement", function(data){
        var room = rooms[socket.roomindex];
        
        if(room !== undefined){
            if(room.game.running){
                var game = room.game;
                var player = game.players[socket.playerindex];
                
                var my = ((game.canvas.height / 35) * -data.beta) + game.canvas.height / 2;
                var mx = ((game.canvas.width / 35) * data.alpha) + game.canvas.width / 2;
            
                if(player.index == 0 || player.index == 1)
                    player.paddle.move(null, my);
                else
                    player.paddle.move(mx, null);
            }
        }
        
    });
    
});

function sendNewRoomlist(){
    var roomnames = [];

    rooms.forEach(function(room){
        if(room.desktopSockets.length < 4 && !room.game.running)
            roomnames.push(room.roomID);
    });
    
    clients.forEach(function(socket){
        socket.emit("update roomlist", {
            roomlist: roomnames
        });
    });

};

function sendPlayerList(room){
    var playernames = [];
    
    room.mobileSockets.forEach(function(socket){
        playernames.push(socket.userid);
    });
    
    room.desktopSockets.forEach(function(socket){
        socket.emit("update playerlist", {
            playerlist: playernames
        });
    });

};