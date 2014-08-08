/*
 * The player can be human or computer and always have one paddle
 * The index is the position of the player in the players array
 * @param Integer index 
 * @param Paddle paddle 
 * @param Boolean ai 
 */
var Player = function(index, paddle, ai){
    var obj = this; // Catch this
    obj.paddle = paddle;
    obj.index = index;
    obj.ai = ai;
    obj.score = 0;
    obj.socketid;
    
    var init = function(){ 
        obj.paddle.player = obj; // Attach player to paddle
    
        // Check if the player is human or not
        obj.paddle.ai = obj.ai;
        
        // Set paddle position
        obj.paddle.position = obj.index;
        
        // Init the paddle
        obj.paddle.init();
    }();
    
    // Player lost human
    obj.changeToAI = function(){
        obj.ai = true;
        obj.paddle.ai = true;
    };
    
    obj.updateScore = function(){
        obj.score++;
    };
};

module.exports = Player;