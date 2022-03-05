import { fenCharMap, sanToCoords, coordsToIndex, NUM_ROWS, NUM_COLS, EMPTY_SQUARE, isUpperCase } from './utilities.js';

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

        this.board[3][1] = new Piece('r', 'w');
    }
    //current turn is assumed to be owner of clicked piece
    static generateMoves(row, col, chessboard){
        let board = chessboard.board;
        let piece = board[row][col];
        
        let moves1d = [];//final
        let moves2d = [];//start as pairs (row, col) => (uci) 
        if (!piece){ return moves1d; }
        //trust that this turn was set appropriately
        let turn = piece.color;
        
        
        switch(piece.type){
            //case 'p'://pawn
            //    return;
            case 'n'://knight
                moves2d.push([row - 2, col - 1]);
                moves2d.push([row - 2, col + 1]);
                moves2d.push([row - 1, col - 2]);
                moves2d.push([row - 1, col + 2]);
                moves2d.push([row + 1, col - 2]);
                moves2d.push([row + 1, col + 2]);
                moves2d.push([row + 2, col - 1]);
                moves2d.push([row + 2, col + 1]);
                //coord bound check and piece check
                return moves2d.filter(coord => {
                    let crow = coord[0];
                    let ccol = coord[1];
                    if (crow > -1 && crow < NUM_ROWS && ccol > -1 && ccol < NUM_COLS){
                        //look for check later
                        let coordPiece = board[crow][ccol];
                        if (!coordPiece || coordPiece.color !== turn){
                            return true;
                        }
                    }
                    return false;
                }).map(coord2d => coordsToIndex(coord2d[0], coord2d[1]));
            case 'r'://rook
                for (let i = row - 1; i > -1; i--){//up
                    let piece = board[i][col];
                    if (piece){//collided with a piece
                        if (piece.color !== turn){ moves2d.push([i, col]); }
                        break;
                    }
                    moves2d.push([i, col]);
                }
                for (let i = row + 1; i < NUM_ROWS; i++){//down
                    let piece = board[i][col];
                    if (piece){//collided with a piece
                        if (piece.color !== turn){ moves2d.push([i, col]); }
                        break;
                    }
                    moves2d.push([i, col]);
                }
                for (let j = col - 1; j > -1; j--){//left
                    let piece = board[row][j];
                    if (piece){//collided with a piece
                        if (piece.color !== turn){ moves2d.push([row, j]); }
                        break;
                    }
                    moves2d.push([row, j]);
                }
                for (let j = col + 1; j < NUM_COLS; j++){//right
                    let piece = board[row][j];
                    if (piece){//collided with a piece
                        if (piece.color !== turn){ moves2d.push([row, j]); }
                        break;
                    }
                    moves2d.push([row, j]);
                }
                return moves2d.map(coord => coordsToIndex(coord[0], coord[1]));
            //case 'b'://bishop
            //    return;
            //case 'k'://king
            //    return;
            //case 'q'://queen
            //    return;
            //default://?? other
            //    break;
                //return;
        }
        return moves1d;
    }
    
    static generateMovesFromIndex(index, chessboard){
        let row = Math.trunc(index/NUM_ROWS);
        let col = index%NUM_COLS;
        return this.generateMoves(row, col, chessboard);
    }
    static generateMovesFromSan(san, chessboard){//accepts a1, b3, etc.
        let coords = sanToCoords(san);
        let row = coords[0];
        let col = coords[1];
        return this.generateMoves(row, col, chessboard);
    }
    

    pushUci(move){
        let startCoords = sanToCoords(move.substring(0,2));
        let startRow = startCoords[0];
        let startCol = startCoords[1];
        let piece = this.board[startRow][startCol];
        let endCoords = sanToCoords(move.substring(2));
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