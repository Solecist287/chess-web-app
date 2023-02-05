const path = require('path');
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 8080;

const stockfish = require("stockfish");
const myEngine = stockfish();

const app = express();
app.use(cors());

app.get('/engine/new-game', function (req, res) {

  myEngine.onmessage = function(msg) {
    console.log(msg);
    if (typeof msg === 'string' && msg.match("readyok")){
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify({'status': 'readyok'}));
    }
  }
  //startup
  myEngine.postMessage('uci');
  myEngine.postMessage('ucinewgame');
  myEngine.postMessage('isready');
})

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

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.use(express.static(path.join(__dirname, '../frontend', 'build')));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});