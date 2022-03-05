export const NUM_ROWS = 8;
export const NUM_COLS = 8;
export const EMPTY_SQUARE = ' ';
export const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];//top to bottom (numbers)
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];//left to right (letters)

//algebraic notation to [row, col]
export function sanToCoords(san){
    let row = Math.abs(Number(san[1]) - NUM_ROWS);
    let col = Math.abs(san.charCodeAt(0) - 97);
    return [row, col];
}

//algebraic notation to 1-d index
export function sanToIndex(san){
    let coords = sanToCoords(san);
    return coords[0] * NUM_ROWS + coords[1];
}

export function coordsToIndex(row, col){
    return row * NUM_ROWS + col;
}

export const fenCharMap = {
    'b': 'b',
    'B': 'B',
    'k': 'k',
    'K': 'K',
    'n': 'n',
    'N': 'N',
    'p': 'p',
    'P': 'P',
    'q': 'q',
    'Q': 'Q',
    'r': 'r',
    'R': 'R',
    '1': 'x',
    '2': 'xx',
    '3': 'xxx',
    '4': 'xxxx',
    '5': 'xxxxx',
    '6': 'xxxxxx',
    '7': 'xxxxxxx',
    '8': 'xxxxxxxx'    
}