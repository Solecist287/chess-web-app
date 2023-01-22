const blackBishop = require('../images/blackBishop.png');
const whiteBishop = require('../images/whiteBishop.png');
const blackKing = require('../images/blackKing.png');
const whiteKing = require('../images/whiteKing.png');
const blackKnight = require('../images/blackKnight.png');
const whiteKnight = require('../images/whiteKnight.png');
const blackPawn = require('../images/blackPawn.png');
const whitePawn = require('../images/whitePawn.png');
const blackQueen = require('../images/blackQueen.png');
const whiteQueen = require('../images/whiteQueen.png');
const blackRook = require('../images/blackRook.png');
const whiteRook = require('../images/whiteRook.png');

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