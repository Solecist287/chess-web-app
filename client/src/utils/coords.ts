// types
import { Piece } from './chess';
//constants
import { NUM_ROWS, NUM_COLS, FILES, RANKS, EMPTY_SQUARE } from './constants';

//algebraic notation to [row, col]
export function sanToCoords(san: string){
    let row = Math.abs(Number(san.charAt(1)) - NUM_ROWS);
    let col = Math.abs(san.charCodeAt(0) - 97);
    return [row, col];
}

//algebraic notation to 1-d index
export function sanToIndex(san: string){
    let coords = sanToCoords(san);
    return coords[0] * NUM_ROWS + coords[1];
}

//(row, col) => num range (0-62 inclusive)
export function coordsToIndex(row: number, col: number){
    return row * NUM_ROWS + col;
}

//(num) => [row, col]
export function indexToCoords(index: number){
    let row = Math.trunc(index/NUM_ROWS);
    let col = index%NUM_COLS;
    return [row, col];
}

export function coordsToSan(row: number, col: number){
    return `${FILES[col]}${RANKS[row]}`;
}

//checks if row and col are within bounds of the board
export function areCoordsWithinBounds(row: number, col: number){
    return row < NUM_ROWS && row > -1 && col < NUM_COLS && col > -1;
}

export function pieceToChar(piece: Piece | null){
    if (!piece){
        return EMPTY_SQUARE;
    }
    let char = piece.type;
    if (piece.color === 'w'){
        return char.toUpperCase();
    }
    return char;
}