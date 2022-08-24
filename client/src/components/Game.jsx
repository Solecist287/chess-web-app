import React from 'react';

import Chess from '../utilities/chess.js';
import { EMPTY_SQUARE, NUM_COLS, NUM_ROWS } from '../utilities/utilities.js';

import Header from './Header.jsx';
import Board from './Board.jsx';
import Footer from './Footer.jsx';
import PawnPromotion from './PawnPromotion.jsx';

class Game extends React.Component {
    constructor(props){
        super(props);
        this.worker = new Worker(`${process.env.PUBLIC_URL}/stockfish.js`);
        this.chess = new Chess();
        this.state = {
            turn: 'w',
            player: 'w',
            selected: null,
            isBoardReversed: false,
            moveMap: {},//map of nums range (0-63), includes clicked piece and its possible moves
            boards: [this.chess.toString()],//list of board strings i.e. arr[64]
            boardIndex: 0,//which board in boards[] to view when looking at prev moves
            fullMoveClock: 1,
            message: '',
            isGameOver: false,
            showPawnPromotionPopup: false,//remove: set to false
        }
    }

    componentDidMount(){
        window.addEventListener('message', this.relayEngineResponse);

        this.worker.onmessage = function(oEvent) {
            console.log('Worker said : ' + oEvent.data);
            let tokens = oEvent.data.split(' ');
            if (tokens[0] === 'bestmove'){
                postMessage(tokens[1]);
            }
        };
        this.worker.postMessage('uci');
        this.worker.postMessage('ucinewgame');
        this.worker.postMessage('isready');
    }

    componentWillUnmount(){
        window.removeEventListener('message', this.relayEngineResponse);
        this.worker.terminate();
    }

    relayEngineResponse = (oEvent) => {
        //console.log(oEvent.data);
        //console.log(typeof oEvent.data);
        if (typeof oEvent.data === 'string'){
            let san = String(oEvent.data).substring(0,4);
            let promotion = String(oEvent.data).charAt(4);
            this.chess.pushUciMove(san);
            if (promotion){
                this.chess.promotePawn(promotion);
            }
            this.concludeTurn();
        }
    }

    sendMoveToEngine = (nextFullMoveClock, nextTurn) => {
        let fen = Chess.generateFen(nextFullMoveClock, nextTurn, this.chess);
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage('go');
        //this.worker.postMessage('stop');
    }

    //increment/reset state, set game state flags for next turn
    concludeTurn = () => {
        const { turn, boards, fullMoveClock, } = this.state;
        let nextTurn = turn === 'w' ? 'b' : 'w';
        console.log(`now: ${turn}, next: ${nextTurn}`);
        let newState = {
            selected: null,
            turn: nextTurn,
            moveMap: {},
            boards: [...boards, this.chess.toString()],
            boardIndex: boards.length
        };
        //increment full move clock when black concludes turn
        if (turn === 'b'){
            newState['fullMoveClock'] = fullMoveClock + 1;
        }
        let isKingInCheck = Chess.isKingInCheck(nextTurn, this.chess);
        let currentColor = turn === 'w' ? 'White' : 'Black';
        let nextColor = nextTurn === 'w' ? 'White' : 'Black';
        if (Chess.hasValidMoves(nextTurn, this.chess)){
            newState['isGameOver'] = false;
            newState['message'] = isKingInCheck ? `${nextColor} in check!` : '';
        }else{//gameover: either checkmate or stalemate
            newState['message'] = isKingInCheck ? `${currentColor} wins!` : 'Stalemate';
            newState['isGameOver'] = true;
        }
        this.setState(newState);
    }

    navigateToRecordedBoard = (step) => {
        this.setState({boardIndex: step, moveMap: {}, selected: null});
    }

    concludePlayerTurn = () => {
        const { turn, fullMoveClock, } = this.state;
        this.concludeTurn();
        let nextTurn = turn === 'w' ? 'b' : 'w';
        let nextFullMoveClock = turn === 'b' ? fullMoveClock + 1 : fullMoveClock;
        this.sendMoveToEngine(nextFullMoveClock, nextTurn);    
    }

    render(){
        const root = {
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        };
        const buttonContainer = {
            display: 'flex',
            flexDirection: 'row',
            width: '80vh',
            justifyContent: 'space-between',
        }

        const { 
            selected,
            turn,
            fullMoveClock,
            player,
            moveMap,
            boards, 
            boardIndex, 
            isBoardReversed,
            message,
            isGameOver,
            showPawnPromotionPopup,
        } = this.state;

        let turnColor = turn === 'w' ? 'White' : 'Black';
        let turnString = `${player === turn ? 'Your' : `Computer's`} turn (${turnColor})`;
        return(
            <div style={root}>
                <div>{ `Player vs Stockfish! ${turnString}`}</div>
                <div>{message}</div>
                <Header />
                <Board
                    disabled={player !== turn || isGameOver}
                    selected={selected}
                    moveMap={moveMap}
                    onSelection={(index, symbol) => {
                        if (index === selected) {return;}
                        let isPlayerWhite = player === 'w';
                        let isSymbolUpperCase = symbol === symbol.toUpperCase();
                        //if move is in movemap
                        if (index in moveMap){
                            if (!Chess.wouldIndexMovePutKingInCheck(selected, index, player, this.chess)){
                                this.chess.pushIndexMove(selected, index);
                                //if pawn promotion...
                                if (String(symbol).toLowerCase() === 'p' && ((isPlayerWhite && index < NUM_COLS)||(!isPlayerWhite && index > 55))){
                                    this.setState({showPawnPromotionPopup: true});
                                }else{
                                    this.concludePlayerTurn();
                                }
                            }else{//king in check!
                                this.setState({
                                    message: 'Cannot put your king in check!'
                                });
                            }
                        }
                        //only select square where it has a piece you own
                        else if (symbol !== EMPTY_SQUARE && isPlayerWhite === isSymbolUpperCase){
                            //generate possible moves for movemap
                            let possibleMoves = Chess.generateMovesFromIndex(index, this.chess);
                            let moveMap = possibleMoves.reduce((map, move) => {
                                map[move] = move;
                                return map;
                            }, {});
                            //permit board to highlight selected piece, along with its possible moves
                            this.setState({
                                selected: index,
                                moveMap: moveMap
                            });
                        }
                    }}
                    board={boards[boardIndex]}
                    isReversed={isBoardReversed}
                />
                <div style={buttonContainer}>
                    <button
                        disabled={boardIndex <= 0} 
                        onClick={() => this.navigateToRecordedBoard(boardIndex - 1)}
                    >
                        prev
                    </button>
                    <button onClick={() => this.setState({isBoardReversed: !isBoardReversed})}>
                        flip
                    </button>
                    <button
                        disabled={boardIndex >= boards.length - 1} 
                        onClick={() => this.navigateToRecordedBoard(boardIndex + 1)}
                    >
                        next
                    </button>
                </div>
                <Footer />
                {showPawnPromotionPopup && (
                    <PawnPromotion 
                        promote={(promotion) => {
                            this.chess.promotePawn(promotion);
                        }}
                    />
                )}
            </div>
        );
    }
}
export default Game;