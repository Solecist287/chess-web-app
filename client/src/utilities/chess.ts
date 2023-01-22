import { sanToCoords, coordsToIndex, indexToCoords, coordsToSan, areCoordsWithinBounds, NUM_ROWS, NUM_COLS, EMPTY_SQUARE, pieceToChar } from './utilities';

export class Piece{
    readonly type: string;
    readonly color: string;
    timesMoved: number;
    constructor(type: string, color: string){
        this.type = type;
        this.color = color;
        this.timesMoved = 0;
    }
}

export type Board = (Piece | null)[][]

export function createInitialBoard(): Board{
    const board = new Array(NUM_ROWS);
    //INITIALIZE BOARD w/ 2-d array and fill with nulls
    for (let i = 0; i < NUM_ROWS; i++){
        board[i] = new Array(NUM_COLS).fill(null);
    }
    //add pawns
    ///*
    for (let j = 0; j < NUM_COLS; j++){//pawns
        board[1][j] = new Piece('p', 'b'); //b pawns
        board[6][j] = new Piece('p', 'w');//w pawns
    }
    //add rest of black pieces
    
    board[0][0] = new Piece('r', 'b');
    board[0][1] = new Piece('n', 'b');
    board[0][2] = new Piece('b', 'b');
    board[0][3] = new Piece('q', 'b');
    board[0][4] = new Piece('k', 'b');
    board[0][5] = new Piece('b', 'b');
    board[0][6] = new Piece('n', 'b');
    board[0][7] = new Piece('r', 'b');
    //add rest of white pieces
    board[7][0] = new Piece('r', 'w');
    board[7][1] = new Piece('n', 'w');
    board[7][2] = new Piece('b', 'w');
    board[7][3] = new Piece('q', 'w');
    board[7][4] = new Piece('k', 'w');
    board[7][5] = new Piece('b', 'w');
    board[7][6] = new Piece('n', 'w');
    board[7][7] = new Piece('r', 'w');
    //*/
    //board[1][1] = new Piece('p', 'w');
    //board[6][6] = new Piece('p', 'b');

    //board[7][4] = new Piece('k', 'b');
    //board[0][4] = new Piece('k', 'w');
    return board;
}

export function generateMovesForBishop(board: Board, color: string, row: number, col: number){
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

export function generateMovesForRook(board: Board, color: string, row: number, col: number){
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
export function generateMoves(board: Board, lastMovedRow: number, lastMovedCol: number, row: number, col: number){
    let selected = board[row][col];

    let moves2d: number[][] = [];//start as pairs (row, col) => (index) 
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
                            epSquare &&                                         //enemy exists
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
            return [...generateMovesForBishop(board, color, row, col), ...generateMovesForRook(board, color, row, col)];
        case 'r'://rook
            return generateMovesForRook(board, color, row, col);
        case 'b'://bishop
            return generateMovesForBishop(board, color, row, col);
        default:
            break;
    }
    return moves2d;
}

//promotes last moved pawn to a given rank, otherwise queen
export function pushPawnPromotion(originalBoard: Board, row: number, col: number, promotion='q'){
    let board = structuredClone(originalBoard);
    let pawn = board[row][col];
    if (pawn){
        board[row][col] = new Piece(promotion, pawn.color);
    }
    return board;
}

//execute move, record last move, change turn?, flag if check then castling check
//moves are assumed to have ALREADY been VALIDATED!!! (by engine or move generator)
export function pushMove(originalBoard: Board, startRow: number, startCol: number, endRow: number, endCol: number){
    let board = structuredClone(originalBoard);
    let movingPiece = board[startRow][startCol];
    if (!movingPiece){ return board; }

    let movingPieceTimesMoved = movingPiece.timesMoved;
    let dest = board[endRow][endCol];
    switch (movingPiece.type){
        case 'p':
            //en passant: if pawn is attacking and no piece there
            if (Math.abs(startRow - endRow) === 1 && Math.abs(startCol - endCol) === 1 && !dest){
                //movement: positive if downward, negative if upward
                let forward = Math.sign(endRow - startRow);
                //delete victim piece in en passant
                board[endRow - forward][endCol] = null;
            }
            break;
        case 'k'://castling case
            if (Math.abs(startCol - endCol) === 2){
                //grab columns of castling rook starting and ending position
                let rookEndCol = endCol - startCol > 0 ? NUM_COLS - 3 : 3;
                let rookStartCol = endCol - startCol > 0 ? NUM_COLS - 1 : 0;
                let castlingRook = board[startRow][rookStartCol];
                //move rook
                board[endRow][rookEndCol] = castlingRook;//move to new place
                if (castlingRook){
                    castlingRook.timesMoved = 1;//update rook move count
                }
                board[startRow][rookStartCol] = null;//clear original
            }
            break;
        default:
            break;
    }
    
    //do base move for all pieces including above cases
    board[endRow][endCol] = movingPiece;//set to destination
    board[startRow][startCol] = null;//clear original
    
    //set move flags
    movingPiece.timesMoved = movingPieceTimesMoved + 1;//increment move count
    return board;
}

export function getKingCoords(board: Board, color: string){
    for (let i = 0; i < NUM_ROWS; i++){
        for (let j = 0; j < NUM_COLS; j++){
            let piece = board[i][j];
            if (piece && piece.type === 'k' && piece.color === color){
                return [i, j];
            }
        }
    }
    return [-1, -1];
}

export function getKingIndex(board: Board, color: string){
    let [kingRow, kingCol] = getKingCoords(board, color);
    return kingRow * NUM_ROWS + kingCol;
}

export function isPositionInCheck(board: Board, turn: string, row: number, col: number){
    //get kings
    let [otherKingRow, otherKingCol] = getKingCoords(board, turn === 'w' ? 'b' : 'w');
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

export function isKingInCheck(board: Board, turn: string){
    let [kingRow, kingCol] = getKingCoords(board, turn);
    return isPositionInCheck(board, turn, kingRow, kingCol);
}

//move was already computed by chess engine or move generator
//makes deep copy of chess game, executes move and checks if king is in danger
//returns boolean
export function wouldMovePutKingInCheck(originalBoard: Board, turn: string, startRow: number, startCol: number, endRow: number, endCol: number){

    //castling?
    let king = originalBoard[startRow][startCol];
    if (king && king.type === 'k' && Math.abs(startCol - endCol) === 2){
        //check if king already in check
        if (isPositionInCheck(originalBoard, turn, startRow, startCol)){
            return true;
        }
        //check if in-between square is in check
        let copiedBoard = structuredClone(originalBoard);
        let betweenCol = Math.min(startCol, endCol) + 1;
        copiedBoard = pushMove(copiedBoard, startRow, startCol, endRow, betweenCol);
        if (isPositionInCheck(originalBoard, turn, endRow, betweenCol)){
            return true;
        }
    }
    //copy chess game to execute hypothetical moves
    let copiedBoard = structuredClone(originalBoard);
    copiedBoard = pushMove(copiedBoard, startRow, startCol, endRow, endCol);
    return isKingInCheck(copiedBoard, turn);
}

//purpose: see whether there are moves that do not put own king in check
//true: continue, false: check/stalemate 
export function hasValidMoves(board: Board, turn: string, lastMovedRow: number, lastMovedCol: number){
    for (let startRow = 0; startRow < NUM_ROWS; startRow++){
        for (let startCol = 0; startCol < NUM_COLS; startCol++){
            let piece = board[startRow][startCol];
            if (piece && piece.color === turn){
                let moves2d = generateMoves(board, lastMovedRow, lastMovedCol, startRow, startCol);
                for (let i = 0; i < moves2d.length; i++){
                    let [endRow, endCol] = moves2d[i];
                    //if move doesn't put king in check, then valid move
                    if (!wouldMovePutKingInCheck(board, turn, startRow, startCol, endRow, endCol)){
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

export function generateFen(board: Board, turn: string, fullMoveClock: number, lastMovedRow: number, lastMovedCol: number){
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
    let lastMovedPiece = lastMovedRow && lastMovedCol ? board[lastMovedRow][lastMovedCol] : null;
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

export function boardToString(board: Board){
    let output = '';
    for (let i = 0; i < NUM_ROWS; i++){
        for (let j = 0; j < NUM_COLS; j++){
            let piece = board[i][j];
            output += pieceToChar(piece);
        }
    }
    return output;
}