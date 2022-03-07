import { fenCharMap, sanToCoords, coordsToIndex, indexToCoords, NUM_ROWS, NUM_COLS, EMPTY_SQUARE, isUpperCase } from './utilities.js';

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
        this.lastMovedRow = null;
        this.lastMovedCol = null;
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

        //this.board[3][0] = new Piece('r', 'w');
        //this.board[3][6] = new Piece('q', 'w');
        //this.board[3][4] = new Piece('b', 'w');
        //this.board[5][6] = new Piece('r', 'b');
    }
    //current turn is assumed to be owner of clicked piece
    static generateMoves(row, col, chessboard){
        let board = chessboard.board;
        let selected = board[row][col];
        let lastMovedRow = chessboard.lastMovedRow;
        let lastMovedCol = chessboard.lastMovedCol;

        let moves2d = [];//start as pairs (row, col) => (index) 
        if (!selected){ return moves2d; }
        let color = selected.color;
        let timesMoved = selected.timesMoved;

        switch(selected.type){
            case 'p'://pawn
                let forward = color === 'b' ? 1 : -1;
                //has a row ahead
                if (row + forward > -1 && row + forward < NUM_ROWS){
                    //move forward if space is blank
                    if (!board[row + forward][col]){
                        moves2d.push([row + forward, col]);
                        //check if can do two space move (checked first already)
                        if (timesMoved === 0 && row + forward * 2 > -1 && row + forward * 2 < NUM_ROWS && !board[row + forward * 2][col]){
                            moves2d.push([row + forward * 2, col]);
                        }
                    }
                    // if space is accessible on left/right side of board, choose which attack
                    [-1, 1].forEach(side => {
                        //if diagonal on the board
                        if (col + side < NUM_COLS && col + side > -1){
                            let diagonal = board[row + forward][col + side];
                            let epRow = row;
                            let epCol = col + side;
                            let epSquare = board[epRow][epCol];
                            if (diagonal){//rule out en passant if occupied
                                if (diagonal.color !== color){//regular attack
                                    moves2d.push([row + forward, col + side]);
                                }
                            }else if (//en passant
                                lastMovedRow === epRow && lastMovedCol === epCol && //last moved piece
                                epSquare.color !== color && epSquare.type === 'p' && //enemy pawn
                                epSquare.timesMoved === 1 && 
                                ((epSquare.color === 'w' && epRow === 4) || (epSquare.color === 'b' && epRow === 3))
                            ){
                                moves2d.push([row + forward, col + side]);
                            }
                        }
                    });
                }
                break;
            case 'n'://knight
                let unfilteredMoves = [ 
                    [row - 2, col - 1], [row - 2, col + 1], 
                    [row - 1, col - 2], [row - 1, col + 2], 
                    [row + 1, col - 2], [row + 1, col + 2],
                    [row + 2, col - 1], [row + 2, col + 1]
                ];
                //coords bound check and piece check
                moves2d = unfilteredMoves.filter(coords => {
                    let [crow, ccol] = coords;
                    if (crow > -1 && crow < NUM_ROWS && ccol > -1 && ccol < NUM_COLS){
                        //look for check later
                        let coordsPiece = board[crow][ccol];
                        if (!coordsPiece || coordsPiece.color !== color){
                            return true;
                        }
                    }
                    return false;
                });
                break;
            case 'k'://king
                let directionalMoves = [
                    [row + 1, col],//down
                    [row + 1, col - 1],//down left
                    [row + 1, col + 1],//down right
                    [row - 1, col],//up
                    [row - 1, col - 1],//up left
                    [row - 1, col + 1],//up right
                    [row, col - 1],//left
                    [row, col + 1]//right
                ];
                moves2d = directionalMoves.filter(coords => {
                    let [crow, ccol] = coords;
                    if (crow > -1 && crow < NUM_ROWS && ccol > -1 && ccol < NUM_COLS){
                        //look for check later
                        let coordsPiece = board[crow][ccol];
                        if (!coordsPiece || coordsPiece.color !== color){
                            return true;
                        }
                    }
                    return false;
                });
                if (timesMoved === 0){//king can castle
                    let rightRook = board[row][NUM_COLS - 1];
                    if (rightRook && rightRook.type === 'r' && rightRook.color === color && rightRook.timesMoved === 0){//rooks on right side of board castle
                        let areMiddleSquaresClear = true;
                        for (let j = col + 1; j < NUM_COLS - 1; j++){
                            if (board[row][j]){ 
                                areMiddleSquaresClear = false;    
                                break; 
                            }
                        }
                        if (areMiddleSquaresClear){
                            moves2d.push([row, col + 2]);
                        }
                    }
                    let leftRook = board[row][0];
                    if (leftRook && leftRook.type === 'r' && leftRook.color === color && leftRook.timesMoved === 0){//rooks on left side of board castle
                        let areMiddleSquaresClear = true;
                        for (let j = 1; j < col; j++){
                            if (board[row][j]) /*or square in check*/{ 
                                areMiddleSquaresClear = false;    
                                break; 
                            }
                        }
                        if (areMiddleSquaresClear){
                            moves2d.push([row, col - 2]);
                        }
                    }
                }
                break;
            case 'q'://queen poses as rook and bishop
            case 'r'://rook
                for (let i = row - 1; i > -1; i--){//up
                    let piece = board[i][col];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([i, col]); }
                        break;
                    }
                    moves2d.push([i, col]);
                }
                for (let i = row + 1; i < NUM_ROWS; i++){//down
                    let piece = board[i][col];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([i, col]); }
                        break;
                    }
                    moves2d.push([i, col]);
                }
                for (let j = col - 1; j > -1; j--){//left
                    let piece = board[row][j];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([row, j]); }
                        break;
                    }
                    moves2d.push([row, j]);
                }
                for (let j = col + 1; j < NUM_COLS; j++){//right
                    let piece = board[row][j];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([row, j]); }
                        break;
                    }
                    moves2d.push([row, j]);
                }
                if (selected.type !== 'q'){ break; }
            case 'b'://bishop
                let uri = row - 1;
                let urj = col + 1;
                while (uri > -1 && urj < NUM_COLS){//upper right
                    let piece = board[uri][urj];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([uri, urj]); }
                        break;
                    }
                    moves2d.push([uri, urj]);
                    uri--;
                    urj++;
                }
                let dli = row + 1;
                let dlj = col - 1;
                while (dli < NUM_ROWS && dlj > -1){//down left
                    let piece = board[dli][dlj];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([dli, dlj]); }
                        break;
                    }
                    moves2d.push([dli, dlj]);
                    dli++;
                    dlj--;
                }
                let uli = row - 1;
                let ulj = col - 1;
                while (uli > -1 && ulj > -1){//up left
                    let piece = board[uli][ulj];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([uli, ulj]); }
                        break;
                    }
                    moves2d.push([uli, ulj]);
                    uli--;
                    ulj--;
                }
                let dri = row + 1;
                let drj = col + 1;
                while (dri < NUM_ROWS && drj < NUM_COLS){//down right
                    let piece = board[dri][drj];
                    if (piece){//collided with a piece
                        if (piece.color !== color){ moves2d.push([dri, drj]); }
                        break;
                    }
                    moves2d.push([dri, drj]);
                    dri++;
                    drj++;
                }
                if (selected.type !== 'q'){ break; }
            default:
                break;
        }
        return moves2d.map(coords2d => coordsToIndex(coords2d[0], coords2d[1]));
    }
    
    static generateMovesFromIndex(index, chessboard){
        let row = Math.trunc(index/NUM_ROWS);
        let col = index%NUM_COLS;
        return this.generateMoves(row, col, chessboard);
    }
    static generateMovesFromSan(san, chessboard){//accepts a1, b3, etc.
        let [row, col] = sanToCoords(san);
        return this.generateMoves(row, col, chessboard);
    }
    //execute move, record last move, change turn?, flag if check then castling check
    //moves are assumed to have ALREADY been VALIDATED!!! (by engine or move generator)
    pushMove(startRow, startCol, endRow, endCol){
        let movingPiece = this.board[startRow][startCol];
        if (!movingPiece){ return; }
        let movingPieceTimesMoved = movingPiece.timesMoved;
        let dest = this.board[endRow][endCol];
        if (!movingPiece){ return; }
        switch (movingPiece.type){
            case 'p':
                //en passant: if pawn is attacking and no piece there
                if (Math.abs(startRow - endRow) === 1 && Math.abs(startCol - endCol) === 1 && !dest){
                    //movement: positive if downward, negative if upward
                    let forward = Math.sign(endRow - startRow);
                    //delete victim piece in en passant
                    this.board[endRow - forward][endCol] = null;
                }
                break;
            case 'k'://castling case
                if (Math.abs(startCol - endCol) === 2){
                    //grab columns of castling rook starting and ending position
                    let rookEndCol = endCol - startCol > 0 ? NUM_COLS - 3 : 3;
                    let rookStartCol = endCol - startCol > 0 ? NUM_COLS - 1 : 0;
                    let castlingRook = this.board[startRow][rookStartCol];
                    //move rook
                    this.board[endRow][rookEndCol] = castlingRook;//move to new place
                    this.board[endRow][rookEndCol].timesMoved = 1;//update rook move count
                    this.board[startRow][rookStartCol] = null;//clear original
                }
                break;
            default:
                break;
        }
        //do base move for all pieces including above cases
        this.board[endRow][endCol] = movingPiece;//set to destination
        this.board[endRow][endCol].timesMoved = movingPieceTimesMoved + 1;//increment move count
        this.board[startRow][startCol] = null;//clear original
        this.lastMovedRow = endRow;
        this.lastMovedCol = endCol;
    }

    pushUciMove(move){//e.g. 'e5e7'
        let [startRow, startCol] = sanToCoords(move.substring(0,2));
        let [endRow, endCol] = sanToCoords(move.substring(2));
        this.pushMove(startRow, startCol, endRow, endCol);
    }

    pushIndexMove(startIndex, endIndex){
        let [startRow, startCol] = indexToCoords(startIndex);
        let [endRow, endCol] = indexToCoords(endIndex);
        this.pushMove(startRow, startCol, endRow, endCol);
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