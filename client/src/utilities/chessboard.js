import { fenCharMap, positionToCoords, NUM_ROWS, NUM_COLS, EMPTY_SQUARE, isUpperCase } from './utilities.js';

class Piece{
    constructor(type, color){
        this.type = type;
        this.color = color;
        this.timesMoved = 0;
    }
}

var isMoveValid = {
    'p': function(){},
    'n': function(){},
    'r': function(){},
    'b': function(){},
    'k': function(){},
    'q': function(){},
};

class Chessboard{
    constructor(){
        this.whiteCastle = 'KQ';
        this.blackCastle = 'kq';
        this.moveCounter = 1;
        this.lastMoved = null;
        this.turn = 'w';
        this.board = new Array(NUM_ROWS);
        //INITIALIZE BOARD w/ 2-d array and fill with nulls
        for (let i = 0; i < NUM_ROWS; i++){
            this.board[i] = new Array(NUM_COLS).fill(null);
        }
        //add pawns
        for (let j = 0; j < NUM_COLS; j++){//pawns
            this.board[1][j] = new Piece('p', 'b'); //b pawns
            this.board[6][j] = new Piece('p', 'w');//w pawns
        }
        //add rest of black pieces
        this.board[0][0] = new Piece('r', 'b');
        this.board[0][1] = new Piece('n', 'b');
        this.board[0][2] = new Piece('b', 'b');
        this.board[0][3] = new Piece('q', 'b');
        this.board[0][4] = new Piece('k', 'b');
        this.board[0][5] = new Piece('b', 'b');
        this.board[0][6] = new Piece('n', 'b');
        this.board[0][7] = new Piece('r', 'b');
        //add rest of white pieces
        this.board[7][0] = new Piece('r', 'w');
        this.board[7][1] = new Piece('n', 'w');
        this.board[7][2] = new Piece('b', 'w');
        this.board[7][3] = new Piece('q', 'w');
        this.board[7][4] = new Piece('k', 'w');
        this.board[7][5] = new Piece('b', 'w');
        this.board[7][6] = new Piece('n', 'w');
        this.board[7][7] = new Piece('r', 'w');
    }

    static generateMoves(row, col, chessboard){
        
        let board = chessboard.board;
        let piece = board[row][col];
        //trust that this turn was set appropriately
        let turn = piece.color;
        console.log(row);
        console.log(col);
        let moveList = [];//start as pairs (row, col) => (uci) 
        let output = [];
        //no moves for enemy pieces or empty squares

        if (!piece){ return output; }
        //switch(piece.type){
            //case 'p':
            //    return;
            //case 'n':
            //    return;
            //case 'r':
            //    return;
            //case 'b':
            //    return;
            //case 'k':
            //    return;
            //case 'q':
            //    return;
            //default:
                //return;
        //}
        let pos = row * 8 + col + 1;
        return [pos];
    }
    
    static generateMovesFromIndex(index, chessboard){
        let row = Math.trunc(index/NUM_ROWS);
        let col = index%NUM_COLS;
        return this.generateMoves(row, col, chessboard);
    }
    static generateMovesFromSan(san, chessboard){//accepts a1, b3, etc.
        let coords = positionToCoords(san);
        let row = coords[0];
        let col = coords[1];
        return this.generateMoves(row, col, chessboard);
    }
    

    pushUci(move){
        let startCoords = positionToCoords(move.substring(0,2));
        let startRow = startCoords[0];
        let startCol = startCoords[1];
        let piece = this.board[startRow][startCol];
        let endCoords = positionToCoords(move.substring(2));
        let endRow = endCoords[0];
        let endCol = endCoords[1];

        if (!piece || piece.color !== this.turn){ return; }
        switch (piece.type){
            case 'p'://en passant case
                return;
            case 'k'://castling case
                return;
            default:
                return;
        }
    }
    isKingInCheck(){
        //iterate thru and add enemies to list and current king
        //using this.turn
        return false;
    }

    toString(){
        let output = '';
        for (let i = 0; i < NUM_ROWS; i++){
            for (let j = 0; j < NUM_COLS; j++){
                let piece = this.board[i][j];
                if (piece){
                    let color = piece.color;
                    let type = piece.type;
                    output += color === 'w' ? type.toUpperCase() : type;
                }else{
                    output += EMPTY_SQUARE;
                }
            }
        }
        return output;
    }
}
export default Chessboard;