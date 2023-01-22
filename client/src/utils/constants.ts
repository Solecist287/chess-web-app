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
    'b': blackBishop,
    'B': whiteBishop,
    'k': blackKing,
    'K': whiteKing,
    'n': blackKnight,
    'N': whiteKnight,
    'p': blackPawn,
    'P': whitePawn,
    'q': blackQueen,
    'Q': whiteQueen,
    'r': blackRook,
    'R': whiteRook,
}
export default imageRouter;