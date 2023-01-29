export const WHITE = 'w';
export const BLACK = 'b';
export const RANDOM = 'r';

export const BISHOP = 'b';
export const KING = 'k';
export const KNIGHT = 'n';
export const PAWN = 'p';
export const QUEEN = 'q';
export const ROOK = 'r';

export const NUM_ROWS = 8;
export const NUM_COLS = 8;

export const EMPTY_SQUARE = ' ';
export const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];//top to bottom (numbers)
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];//left to right (letters)

const blackBishop = require('../assets/blackBishop.png');
const whiteBishop = require('../assets/whiteBishop.png');
const blackKing = require('../assets/blackKing.png');
const whiteKing = require('../assets/whiteKing.png');
const blackKnight = require('../assets/blackKnight.png');
const whiteKnight = require('../assets/whiteKnight.png');
const blackPawn = require('../assets/blackPawn.png');
const whitePawn = require('../assets/whitePawn.png');
const blackQueen = require('../assets/blackQueen.png');
const whiteQueen = require('../assets/whiteQueen.png');
const blackRook = require('../assets/blackRook.png');
const whiteRook = require('../assets/whiteRook.png');

const imageRouter: { [key: string]: string } = {
    'b': String(blackBishop),
    'B': String(whiteBishop),
    'k': String(blackKing),
    'K': String(whiteKing),
    'n': String(blackKnight),
    'N': String(whiteKnight),
    'p': String(blackPawn),
    'P': String(whitePawn),
    'q': String(blackQueen),
    'Q': String(whiteQueen),
    'r': String(blackRook),
    'R': String(whiteRook),
}
export default imageRouter;