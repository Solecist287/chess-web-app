const NUM_ROWS = 8;
const NUM_COLS = 8;

function positionToCoords(position){
    row = Math.abs(Number(position[1]) - NUM_ROWS);
    col = Math.abs(position.charCodeAt(0) - 97);
    console.log(row,col);
    return [row, col];
}
function Piece(type, color) {
    this.type = type;
    this.color = color;
    this.timesMoved = 0;
}

var isMoveValid = {
    'p': function(){},
    'n': function(){},
    'r': function(){},
    'b': function(){},
    'k': function(){},
    'q': function(){},
};

var generatePseudoMovesMap = {
    'p': function(){},
    'n': function(){},
    'r': function(){},
    'b': function(){},
    'k': function(){},
    'q': function(){},
}

function Chessboard(){
    this.board = new Array(NUM_ROWS);
    for (let i = 0; i < NUM_ROWS; i++){
        this.board[i] = new Array(NUM_COLS).fill(null);
    }
    this.whiteCastle = 'KQ';
    this.blackCastle = 'kq';
    this.moveCounter = 1;
    this.lastMoved = null;
    this.turn = 'w';
    this.generatePseudoMoves = function (position){//accepts a1, b3, etc.
        let coords = positionToCoords(position);
        let row = coords[0];
        let col = coords[1];
        let piece = this.board[row][col];
        if (!piece){
            return [];
        }
        let func = generatePseudoMovesMap[piece.type];
        return func(row, col);
    }
}
module.exports = new Chessboard();