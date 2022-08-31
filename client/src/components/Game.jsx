import React, { useState, useEffect, } from 'react';
import { useLocation, } from 'react-router-dom';

import Chess from '../utilities/chess.js';
import { EMPTY_SQUARE, NUM_COLS, NUM_ROWS } from '../utilities/utilities.js';

import PlayerCard from './PlayerCard.jsx';
import Board from './Board.jsx';
import PawnPromotion from './PawnPromotion.jsx';
//TODO: generic turncolor function
const colorAsText = (turn) => turn === 'w' ? 'White' : 'Black';

const Game = (props) => {
    const [worker] = useState(new Worker(`${process.env.PUBLIC_URL}/stockfish.js`));
    const [isEngineReady, setIsEngineReady] = useState(false);
    
    const [chess] = useState(new Chess());

    let location = useLocation();
    const {
        player = 'w',
    } = location.state;
    
    const [gameState, setGameState] = useState({
        turn: 'w',
        selected: null,
        isBoardReversed: player === 'b' ? true : false,
        validMoveMap: {},//map of nums range (0-63), includes clicked piece and its possible moves
        boards: [chess.toString()],//list of board strings i.e. arr[64]
        boardIndex: 0,//which board in boards[] to view when looking at prev moves
        fullMoveClock: 1,
        message: `${player === 'w' ? 'Your' : `Computer's`} turn, ${colorAsText('w')}`,
        isGameOver: false,
        warningMap: {},
    });
    const [showPawnPromotionPopup, setShowPawnPromotionPopup] = useState(false);
    
    const {
        turn,
        selected,
        isBoardReversed,
        validMoveMap,
        boards,
        boardIndex,
        fullMoveClock,
        message,
        isGameOver,
        warningMap,
    } = gameState;

    //didmount (set stockfish listener) and didupdate (game state changes)
    useEffect(() => {
        //UPDATE TURN: call engine if computer's turn
        if (isEngineReady && player !== turn){
            console.log('ask robot')
            let fen = Chess.generateFen(fullMoveClock, turn, chess);
            worker.postMessage(`position fen ${fen}`);
            worker.postMessage('go movetime 1000');
            //worker.postMessage('stop');
        }
    }, [gameState, isEngineReady]);

    //unmount for removing stockfish listener
    useEffect(() => {
        console.log('mount') 
        //mount: setup comms with stockfish engine
        window.addEventListener('message', relayEngineResponse);
        worker.onmessage = function(oEvent) {
            console.log('Worker said : ' + oEvent.data);
            let tokens = oEvent.data.split(' ');
            if (tokens[0] === 'bestmove'){
                postMessage(tokens[1]);
            }else if (tokens[0] === 'readyok'){
                setIsEngineReady(true);
            }
        };
        worker.postMessage('uci');
        worker.postMessage('ucinewgame');
        worker.postMessage('isready');
        
        return () => {
            console.log('cleanup');
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
            concludeTurn();
        }
    }

    //increment/reset state, set game state flags for next turn
    const concludeTurn = () => {
        setGameState(prevGameState => {
            const nextTurn = prevGameState.turn === 'w' ? 'b' : 'w';
        
            console.log(`now: ${prevGameState.turn}, next: ${nextTurn}`);
            //increment full move clock when black concludes turn
            let nextFullMoveClock = prevGameState.turn === 'b' ? prevGameState.fullMoveClock + 1 : prevGameState.fullMoveClock;

            let isKingInCheck = Chess.isKingInCheck(nextTurn, chess);
            let currentColorText = colorAsText(prevGameState.turn);
            let nextColorText = colorAsText(nextTurn);

            let nextisGameOver = false;
            let nextMessage = '';
            if (Chess.hasValidMoves(nextTurn, chess)){
                nextMessage = `${player === nextTurn ? 'Your' : `Computer's`} turn, ${nextColorText}`
            }else{//gameover: either checkmate or stalemate
                nextMessage = isKingInCheck ? `${currentColorText} wins!` : 'Stalemate';
                nextisGameOver = true;
            }
            let nextTurnKingIndex = Chess.getKingIndex(nextTurn, chess);
            let nextWarningMap = {};
            if (isKingInCheck){
                nextWarningMap[nextTurnKingIndex] = nextTurnKingIndex;
            }

            return {
                ...prevGameState,
                fullMoveClock: nextFullMoveClock, 
                selected: null,
                turn: nextTurn,
                validMoveMap: {},
                boards: [...prevGameState.boards, chess.toString()],
                boardIndex: prevGameState.boards.length,
                message: nextMessage,
                isGameOver: nextisGameOver,
                warningMap: nextWarningMap
            };
        });
    }

    const navigateToRecordedBoard = (step) => {
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                boardIndex: step,
                validMoveMap: {},
                selected: null
            };
        });
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
        margin: '0 auto',
        justifyContent: 'space-between',
    }
    const isPlayerOnTop = (player === 'b' && !isBoardReversed) || (player === 'w' && isBoardReversed);
    return(
        <div style={root}>
            <div style={{'margin': '0 auto'}}>{ `${message}`}</div>
            <PlayerCard name={isPlayerOnTop ? 'Me' : 'Computer'} />
            <Board
                disabled={player !== turn || isGameOver}
                selected={selected}
                validMoveMap={validMoveMap}
                warningMap={warningMap}
                onSelection={(index, symbol) => {
                    if (index === selected) {return;}
                    let isPlayerWhite = player === 'w';
                    let isSymbolUpperCase = symbol === symbol.toUpperCase();
                    //if move is in movemap
                    if (index in validMoveMap){
                        if (!Chess.wouldIndexMovePutKingInCheck(selected, index, player, chess)){
                            chess.pushIndexMove(selected, index);
                            //if pawn promotion...
                            //console.log(`symbol ${symbol}, iswhite ${isPlayerWhite}, index ${index}`)
                            let isSelectedAPawn = selected && boards[boardIndex].charAt(selected).toLowerCase() === 'p';
                            if (isSelectedAPawn && ((isPlayerWhite && index < NUM_COLS)||(!isPlayerWhite && index > 55))){
                                setShowPawnPromotionPopup(true);
                            }else{
                                concludeTurn();
                            }
                        }else{//king in check!
                            setGameState(prevGameState => {
                                return {
                                    ...prevGameState, 
                                    message: 'Cannot put your king in check!'
                                };
                            });
                        }
                    }
                    //only select square where it has a piece you own
                    else if (symbol !== EMPTY_SQUARE && isPlayerWhite === isSymbolUpperCase){
                        //generate possible moves for movemap
                        let possibleMoves = Chess.generateMovesFromIndex(index, chess);
                        let validMoveMap = possibleMoves.reduce((map, move) => {
                            map[move] = move;
                            return map;
                        }, {});
                        //permit board to highlight selected piece, along with its possible moves
                        setGameState(prevGameState => {
                            return {
                                ...prevGameState,
                                selected: index,
                                validMoveMap: validMoveMap
                            };
                        });
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
                <button 
                    onClick={() => setGameState(prevGameState => {
                        return {
                            ...prevGameState, 
                            isBoardReversed: !isBoardReversed
                        };
                    })}
                >
                    flip
                </button>
                <button
                    disabled={boardIndex >= boards.length - 1} 
                    onClick={() => navigateToRecordedBoard(boardIndex + 1)}
                >
                    next
                </button>
            </div>
            <PlayerCard name={isPlayerOnTop ? 'Computer' : 'Me'} />
            {Boolean(showPawnPromotionPopup) && (
                <PawnPromotion
                    color={turn} 
                    promote={(promotion) => {
                        setShowPawnPromotionPopup(false);
                        chess.promotePawn(promotion);
                        concludeTurn();
                    }}
                />
            )}
        </div>
    );
}
export default Game;