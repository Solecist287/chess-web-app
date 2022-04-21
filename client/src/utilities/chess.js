import { sanToCoords, coordsToIndex, indexToCoords, coordsToSan, areCoordsWithinBounds, NUM_ROWS, NUM_COLS, EMPTY_SQUARE, pieceToChar } from './utilities.js';

class Piece{
    constructor(type, color){
        this.type = type;
        this.color = color;
        this.timesMoved = 0;
    }
}

class Chess{
    constructor(chess){
        this.lastMovedRow = chess ? chess.lastMovedRow : null;
        this.lastMovedCol = chess ? chess.lastMovedCol : null;
        //copy chess board if provided, otherwise initialize normally
        if (chess){//deep copy of existing chess board if provided
            //this.board = JSON.parse(JSON.stringify(chess.board));
            this.board = structuredClone(chess.board);
        }else{//else initiate board the normal way
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
        
    }

    static generateMovesForBishop(row, col, color, board){
        let moves2d = [];
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
        return moves2d;
    }

    static generateMovesForRook(row, col, color, board){
        let moves2d = [];
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
        return moves2d;
    }

    //current turn is assumed to be owner of clicked piece
    static generateMoves(row, col, chess){
        let board = chess.board;
        let selected = board[row][col];
        let lastMovedRow = chess.lastMovedRow;
        let lastMovedCol = chess.lastMovedCol;

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
                    if (areCoordsWithinBounds(crow, ccol)){
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
                    if (areCoordsWithinBounds(crow, ccol)){
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
                return [...this.generateMovesForBishop(row, col, color, board), ...this.generateMovesForRook(row, col, color, board)];
            case 'r'://rook
                return this.generateMovesForRook(row, col, color, board);
            case 'b'://bishop
                return this.generateMovesForBishop(row, col, color, board);
            default:
                break;
        }
        return moves2d;
    }
    
    static generateMovesFromIndex(index, chess){
        let row = Math.trunc(index/NUM_ROWS);
        let col = index%NUM_COLS;
        return this.generateMoves(row, col, chess).map(coords2d => coordsToIndex(coords2d[0], coords2d[1]));;
    }

    //execute move, record last move, change turn?, flag if check then castling check
    //moves are assumed to have ALREADY been VALIDATED!!! (by engine or move generator)
    pushMove(startRow, startCol, endRow, endCol){
        let movingPiece = this.board[startRow][startCol];
        let movingPieceTimesMoved = movingPiece.timesMoved;
        let dest = this.board[endRow][endCol];
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
        this.board[startRow][startCol] = null;//clear original
        
        //set move flags
        this.board[endRow][endCol].timesMoved = movingPieceTimesMoved + 1;//increment move count
        this.lastMovedRow = endRow;
        this.lastMovedCol = endCol;
    }
    
    pushUciMove(move){//e.g. 'e5e7'
        let [startRow, startCol] = sanToCoords(String(move).substring(0,2));
        let [endRow, endCol] = sanToCoords(String(move).substring(2));
        this.pushMove(startRow, startCol, endRow, endCol);
    }

    pushIndexMove(startIndex, endIndex){
        let [startRow, startCol] = indexToCoords(startIndex);
        let [endRow, endCol] = indexToCoords(endIndex);
        this.pushMove(startRow, startCol, endRow, endCol);
    }

    static getKingCoords(color, chess){
        let board = chess.board;
        for (let i = 0; i < NUM_ROWS; i++){
            for (let j = 0; j < NUM_COLS; j++){
                let piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === color){
                    return [i, j];
                }
            }
        }
        return null;
    }

    static isPositionInCheck(row, col, turn, chess){
        let board = chess.board;
        //get kings
        let [otherKingRow, otherKingCol] = this.getKingCoords(turn === 'w' ? 'b' : 'w', chess);
        //check for pawn attackers
        let forward = turn === 'b' ? 1 : -1;
        if (areCoordsWithinBounds(row + forward, col - 1)){//check left "pawn"
            let leftPawn = board[row + forward][col - 1];
            if (leftPawn && leftPawn.type === 'p' && leftPawn.color !== turn){
                return true;
            }
        }
        if (areCoordsWithinBounds(row + forward, col + 1)){//check right "pawn"
            let rightPawn =  board[row + forward][col + 1];
            if (rightPawn && rightPawn.type === 'p' && rightPawn.color !== turn){
                return true;
            }
        }
        //check for knight attackers
        let possibleKnightCoords = [ 
            [row - 2, col - 1], [row - 2, col + 1], 
            [row - 1, col - 2], [row - 1, col + 2], 
            [row + 1, col - 2], [row + 1, col + 2],
            [row + 2, col - 1], [row + 2, col + 1]
        ];
        for (let i = 0; i < possibleKnightCoords.length; i++){
            let knightCoords = possibleKnightCoords[i];
            let [nrow, ncol] = knightCoords;
            if (areCoordsWithinBounds(nrow, ncol)){
                let piece = board[nrow][ncol];
                if (piece && piece.type === 'n' && piece.color !== turn){
                    return true;
                }
            }
        }
        //check for king attacker
        if (Math.abs(otherKingRow - row) < 2 && Math.abs(otherKingCol - col) < 2){
            return true;
        }
        //check for rook/queen attackers
        for (let i = row - 1; i > -1; i--){//up
            let piece = board[i][col];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'r' || piece.type === 'q')){
                    return true;
                }
                break;
            }
        }
        for (let i = row + 1; i < NUM_ROWS; i++){//down
            let piece = board[i][col];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'r' || piece.type === 'q')){
                    return true;
                }
                break;
            }
        }
        for (let j = col - 1; j > -1; j--){//left
            let piece = board[row][j];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'r' || piece.type === 'q')){
                    return true;
                }
                break;
            }
        }
        for (let j = col + 1; j < NUM_COLS; j++){//right
            let piece = board[row][j];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'r' || piece.type === 'q')){
                    return true;
                }
                break;
            }
        }
        //check for bishop/queen attackers
        let uri = row - 1;
        let urj = col + 1;
        while (uri > -1 && urj < NUM_COLS){//upper right
            let piece = board[uri][urj];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'b' || piece.type === 'q')){
                    return true;    
                }
                break;
            }
            uri--;
            urj++;
        }
        let dli = row + 1;
        let dlj = col - 1;
        while (dli < NUM_ROWS && dlj > -1){//down left
            let piece = board[dli][dlj];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'b' || piece.type === 'q')){
                    return true;    
                }
                break;
            }
            dli++;
            dlj--;
        }
        let uli = row - 1;
        let ulj = col - 1;
        while (uli > -1 && ulj > -1){//up left
            let piece = board[uli][ulj];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'b' || piece.type === 'q')){
                    return true;
                }
                break;
            }
            uli--;
            ulj--;
        }
        let dri = row + 1;
        let drj = col + 1;
        while (dri < NUM_ROWS && drj < NUM_COLS){//down right
            let piece = board[dri][drj];
            if (piece){//collided with a piece
                if (piece.color !== turn && (piece.type === 'b' || piece.type === 'q')){
                    return true;
                }
                break;
            }
            dri++;
            drj++;
        }
        return false;
    }

    static isKingInCheck(turn, chess){
        let [kingRow, kingCol] = this.getKingCoords(turn, chess);
        return this.isPositionInCheck(kingRow, kingCol, turn, chess);
    }

    //move was already computed by chess engine or move generator
    //makes deep copy of chess game, executes move and checks if king is in danger
    //returns boolean
    static wouldMovePutKingInCheck(startRow, startCol, endRow, endCol, turn, chess){
        //castling?
        if (chess.board[startRow][startCol].type === 'k' && Math.abs(startCol - endCol) === 2){
            //check if king already in check
            if (this.isPositionInCheck(startRow, startCol, turn, chess)){
                return true;
            }
            //check if in-between square is in check
            let copiedChess = new Chess(chess);
            let betweenCol = Math.min(startCol, endCol) + 1;
            copiedChess.pushMove(startRow, startCol, endRow, betweenCol);
            if (this.isPositionInCheck(endRow, betweenCol, turn, copiedChess)){
                return true;
            }
        }
        //copy chess game to execute hypothetical moves
        let copiedChess = new Chess(chess);
        copiedChess.pushMove(startRow, startCol, endRow, endCol);
        return this.isKingInCheck(turn, copiedChess);
    }

    static wouldIndexMovePutKingInCheck(startIndex, endIndex, turn, chess){
        let [startRow, startCol] = indexToCoords(startIndex);
        let [endRow, endCol] = indexToCoords(endIndex);
        return this.wouldMovePutKingInCheck(startRow, startCol, endRow, endCol, turn, chess);
    }

    //purpose: see whether there are moves that do not put own king in check
    //true: continue, false: check/stalemate 
    static hasValidMoves(turn, chess){
        let board = chess.board;
        for (let startRow = 0; startRow < NUM_ROWS; startRow++){
            for (let startCol = 0; startCol < NUM_COLS; startCol++){
                let piece = board[startRow][startCol];
                if (piece && piece.color === turn){
                    let moves2d = this.generateMoves(startRow, startCol, chess);
                    for (let i = 0; i < moves2d.length; i++){
                        let [endRow, endCol] = moves2d[i];
                        //if move doesn't put king in check, then valid move
                        if (!this.wouldMovePutKingInCheck(startRow, startCol, endRow, endCol, turn, chess)){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    static generateFen(fullMoveClock, turn, chess){
        let board = chess.board;
        let lastMovedRow = chess.lastMovedRow;
        let lastMovedCol = chess.lastMovedCol;
        //turn board to fen string
        let fenBoardArr = [];
        let count = 0;//count consecutive empty squares
        for (let i = 0; i < NUM_ROWS; i++){
            let fenRow = '';
            count = 0;
            for (let j = 0; j < NUM_COLS; j++){
                let piece = board[i][j];
                let pieceChar = pieceToChar(piece);
                if (pieceChar === EMPTY_SQUARE){
                    count++;
                }else{
                    if (count > 0){
                        fenRow += count;
                        count = 0;
                    }
                    fenRow += pieceChar;
                }
            }
            if (count > 0){
                fenRow += count;
            }
            fenBoardArr.push(fenRow);
        }
        let castlingRights = '';
        //white castling rights
        let whiteKing = board[7][4];
        if (whiteKing && whiteKing.type === 'k' && whiteKing.color === 'w' && whiteKing.timesMoved === 0){
            let rightWhiteRook = board[7][7];
            if (rightWhiteRook && rightWhiteRook.type === 'r' && rightWhiteRook.color === 'w' && rightWhiteRook.timesMoved === 0){
                castlingRights += 'K';
            }
            let leftWhiteRook = board[7][0];
            if (leftWhiteRook && leftWhiteRook.type === 'r' && leftWhiteRook.color === 'w' && leftWhiteRook.timesMoved === 0){
                castlingRights += 'Q';
            }
        }else{
            castlingRights += '--';
        }
        //black castling rights
        let blackKing = board[0][4];
        if (blackKing && blackKing.type === 'k' && blackKing.color === 'b' && blackKing.timesMoved === 0){
            let rightBlackRook = board[0][7];
            if (rightBlackRook && rightBlackRook.type === 'r' && rightBlackRook.color === 'b' && rightBlackRook.timesMoved === 0){
                castlingRights += 'k';
            }
            let leftBlackRook = board[0][0];
            if (leftBlackRook && leftBlackRook.type === 'r' && leftBlackRook.color === 'b' && leftBlackRook.timesMoved === 0){
                castlingRights += 'q';
            }
        }else{
            castlingRights += '--';
        }
        //en passant square
        let en = '-';
        let lastMovedPiece = board[lastMovedRow][lastMovedCol];
        if (lastMovedPiece && lastMovedPiece.color !== turn && lastMovedPiece.type === 'p' && //enemy pawn
            lastMovedPiece.timesMoved === 1 && 
            ((lastMovedPiece.color === 'w' && lastMovedRow === 4) || (lastMovedPiece.color === 'b' && lastMovedRow === 3))
        ){
            en = coordsToSan(lastMovedRow, lastMovedCol);
        }
        //half move clock
        let halfMoveClock = 0;
        //console.log(`${fenBoardArr.join('/')} ${turn} ${castlingRights} ${en} ${halfMoveClock} ${fullMoveClock}`);
        return `${fenBoardArr.join('/')} ${turn} ${castlingRights} ${en} ${halfMoveClock} ${fullMoveClock}`;
    }

    toString(){
        let output = '';
        for (let i = 0; i < NUM_ROWS; i++){
            for (let j = 0; j < NUM_COLS; j++){
                let piece = this.board[i][j];
                output += pieceToChar(piece);
            }
        }
        return output;
    }
}
export default Chess;