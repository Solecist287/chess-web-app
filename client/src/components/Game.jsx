import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Chess from '../utilities/chess.js';
import { EMPTY_SQUARE, NUM_COLS, NUM_ROWS } from '../utilities/utilities.js';

import PlayerCard from './PlayerCard.jsx';
import Board from './Board.jsx';
import PawnPromotion from './PawnPromotion.jsx';

const worker = new Worker(`${process.env.PUBLIC_URL}/stockfish.js`);
const chess = new Chess();

//TODO: generic turncolor function

const Game = (props) => {
    const player = useParams().playerColor;
    const [turn, setTurn] = useState('w');
    const [selected, setSelected] = useState(null);
    const [isBoardReversed, setIsBoardReversed] = useState(false);
    const [moveMap, setMoveMap] = useState({});//map of nums range (0-63), includes clicked piece and its possible moves
    const [boards, setBoards] = useState([chess.toString()]);//list of board strings i.e. arr[64]
    const [boardIndex, setBoardIndex] = useState(0);//which board in boards[] to view when looking at prev moves
    const [fullMoveClock, setFullMoveClock] = useState(1);
    const [message, setMessage] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);
    const [showPawnPromotionPopup, setShowPawnPromotionPopup] = useState(false);//remove: set to false

    useEffect(() => {
        console.log('useeffect called');
        //mount: setup comms with stockfish engine
        window.addEventListener('message', relayEngineResponse);

        worker.onmessage = function(oEvent) {
            console.log('Worker said : ' + oEvent.data);
            let tokens = oEvent.data.split(' ');
            if (tokens[0] === 'bestmove'){
                postMessage(tokens[1]);
            }
        };
        worker.postMessage('uci');
        worker.postMessage('ucinewgame');
        worker.postMessage('isready');

        //cleanup on unmount
        return function cleanup(){
            window.removeEventListener('message', relayEngineResponse);
            worker.terminate();
        }
    }, []);

    const relayEngineResponse = (oEvent) => {
        //console.log(oEvent.data);
        //console.log(typeof oEvent.data);
        if (typeof oEvent.data === 'string'){
            let san = String(oEvent.data).substring(0,4);
            let promotion = String(oEvent.data).charAt(4);
            chess.pushUciMove(san);
            if (promotion){
                chess.promotePawn(promotion);
            }
            console.log('robot')
            concludeTurn();
        }
    }

    const sendMoveToEngine = (nextFullMoveClock, nextTurn) => {
        let fen = Chess.generateFen(nextFullMoveClock, nextTurn, chess);
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage('go');
        //worker.postMessage('stop');
    }

    //increment/reset state, set game state flags for next turn
    const concludeTurn = () => {
        const nextTurn = turn === 'w' ? 'b' : 'w';
        
        console.log(`now: ${turn}, next: ${nextTurn}`);
        console.log(`selected:${selected}`)
        //increment full move clock when black concludes turn
        let nextFullMoveClock = turn === 'b' ? fullMoveClock + 1 : fullMoveClock;

        let isKingInCheck = Chess.isKingInCheck(nextTurn, chess);
        let currentColorText = turn === 'w' ? 'White' : 'Black';
        let nextColorText = nextTurn === 'w' ? 'White' : 'Black';

        let nextisGameOver = false
        let nextMessage = '';
        if (Chess.hasValidMoves(nextTurn, chess)){
            nextMessage = isKingInCheck ? `${nextColorText} in check!` : '';
        }else{//gameover: either checkmate or stalemate
            nextMessage = isKingInCheck ? `${currentColorText} wins!` : 'Stalemate';
            nextisGameOver = true;
        }
        setFullMoveClock(nextFullMoveClock);
        setSelected(null);
        setTurn(nextTurn);
        setMoveMap({});
        setBoards([...boards, chess.toString()]);
        setBoardIndex(boards.length);
        setMessage(nextMessage);
        setIsGameOver(nextisGameOver);
    }

    const navigateToRecordedBoard = (step) => {
        setBoardIndex(step);
        setMoveMap({});
        setSelected(null);
    }

    const concludePlayerTurn = () => {
        concludeTurn();
        let nextTurn = turn === 'w' ? 'b' : 'w';
        let nextFullMoveClock = turn === 'b' ? fullMoveClock + 1 : fullMoveClock;
        sendMoveToEngine(nextFullMoveClock, nextTurn);    
    }

    
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

    let turnColor = turn === 'w' ? 'White' : 'Black';
    let turnString = `${player === turn ? 'Your' : `Computer's`} turn (${turnColor})`;
    console.log(turnColor)
    return(
        <div style={root}>
            <div>{ `Player vs Stockfish! ${turnString}`}</div>
            <div>{message}</div>
            <PlayerCard name='Bob' />
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
                        if (!Chess.wouldIndexMovePutKingInCheck(selected, index, player, chess)){
                            chess.pushIndexMove(selected, index);
                            //if pawn promotion...
                            if (String(symbol).toLowerCase() === 'p' && ((isPlayerWhite && index < NUM_COLS)||(!isPlayerWhite && index > 55))){
                                setShowPawnPromotionPopup(true);
                            }else{
                                concludePlayerTurn();
                            }
                        }else{//king in check!
                            setMessage('Cannot put your king in check!');
                        }
                    }
                    //only select square where it has a piece you own
                    else if (symbol !== EMPTY_SQUARE && isPlayerWhite === isSymbolUpperCase){
                        //generate possible moves for movemap
                        let possibleMoves = Chess.generateMovesFromIndex(index, chess);
                        let moveMap = possibleMoves.reduce((map, move) => {
                            map[move] = move;
                            return map;
                        }, {});
                        //permit board to highlight selected piece, along with its possible moves
                        setSelected(index);
                        setMoveMap(moveMap);
                    }
                }}
                board={boards[boardIndex]}
                isReversed={isBoardReversed}
            />
            <div style={buttonContainer}>
                <button
                    disabled={boardIndex <= 0} 
                    onClick={() => navigateToRecordedBoard(boardIndex - 1)}
                >
                    prev
                </button>
                <button onClick={() => setIsBoardReversed(!isBoardReversed)}>
                    flip
                </button>
                <button
                    disabled={boardIndex >= boards.length - 1} 
                    onClick={() => navigateToRecordedBoard(boardIndex + 1)}
                >
                    next
                </button>
            </div>
            <PlayerCard name='Bill' />
            {showPawnPromotionPopup && (
                <PawnPromotion 
                    promote={(promotion) => {
                        chess.promotePawn(promotion);
                    }}
                />
            )}
        </div>
    );
}
export default Game;