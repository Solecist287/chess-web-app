const path = require('path');
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 8080;

//set up express server
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend', 'build')));

//set up stockfish engine
const stockfish = require("stockfish");
const myEngine = stockfish();
myEngine.postMessage('uci');
myEngine.onmessage = function(msg) {
  console.log(msg);
}

//start new game
app.get('/engine/new-game', function (req, res) {
  myEngine.onmessage = function(msg) {
    console.log(msg);
    if (typeof msg === 'string' && msg.match("readyok")){
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify({'status': 'readyok'}));
    }
  }
  //startup
  myEngine.postMessage('ucinewgame');
  myEngine.postMessage('isready');
})

//seek next chess move
app.get('/engine/fen/:fen', function(req, res){
  let fen = req.params.fen;
  // only send response when it is a recommendation
  myEngine.onmessage = function(msg) {  
    console.log(msg);
    // only send response when it is a recommendation
    if (typeof(msg == "string") && msg.match("bestmove")) {
      res.send(JSON.stringify({'sanMove': msg.split(' ')[1]}));
    }
  }
  myEngine.postMessage(`position fen ${fen}`);
  myEngine.postMessage('go movetime 1000');
})

//serve frontend for remaining routes (client-side routing)
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
//server ready to listen on PORT
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});