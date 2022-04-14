export const NUM_ROWS = 8;
export const NUM_COLS = 8;
export const EMPTY_SQUARE = ' ';
export const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];//top to bottom (numbers)
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];//left to right (letters)

//algebraic notation to [row, col]
export function sanToCoords(san){
    let row = Math.abs(Number(san.charAt(1)) - NUM_ROWS);
    let col = Math.abs(san.charCodeAt(0) - 97);
    return [row, col];
}

//algebraic notation to 1-d index
export function sanToIndex(san){
    let coords = sanToCoords(san);
    return coords[0] * NUM_ROWS + coords[1];
}

//(row, col) => num range (0-62 inclusive)
export function coordsToIndex(row, col){
    return row * NUM_ROWS + col;
}

//(num) => [row, col]
export function indexToCoords(index){
    let row = Math.trunc(index/NUM_ROWS);
    let col = index%NUM_COLS;
    return [row, col];
}

export function coordsToSan(row, col){
    return `${FILES[col]}${RANKS[row]}`;
}

//checks if row and col are within bounds of the board
export function areCoordsWithinBounds(row, col){
    return row < NUM_ROWS && row > -1 && col < NUM_COLS && col > -1;
}

export function pieceToChar(piece){
    if (!piece){
        return EMPTY_SQUARE;
    }
    let char = piece.type;
    if (piece.color === 'w'){
        return char.toUpperCase();
    }
    return char;
}