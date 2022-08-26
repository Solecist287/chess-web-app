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
    const [isMounted, setIsMounted] = useState(false);
    
    const [gameState, setGameState] = useState({
        turn: 'w',
        selected: null,
        isBoardReversed: false,
        moveMap: {},//map of nums range (0-63), includes clicked piece and its possible moves
        boards: [chess.toString()],//list of board strings i.e. arr[64]
        boardIndex: 0,//which board in boards[] to view when looking at prev moves
        fullMoveClock: 1,
        message: '',
        isGameOver: false,
    });
    const [showPawnPromotionPopup, setShowPawnPromotionPopup] = useState(false);

    const {
        turn,
        selected,
        isBoardReversed,
        moveMap,
        boards,
        boardIndex,
        fullMoveClock,
        message,
        isGameOver
    } = gameState;

    //didmount (set stockfish listener) and didupdate (game state changes)
    useEffect(() => {
        if (!isMounted){
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
            setIsMounted(true);
        }
        
        //UPDATE TURN: call engine if computer's turn
        if (player !== turn){
            console.log('chess')
            console.log(chess);
            let fen = Chess.generateFen(fullMoveClock, turn, chess);
            worker.postMessage(`position fen ${fen}`);
            worker.postMessage('go');
            //worker.postMessage('stop');
        }
    }, [gameState]);

    //unmount for removing stockfish listener
    useEffect(() => {
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
            let currentColorText = prevGameState.turn === 'w' ? 'White' : 'Black';
            let nextColorText = nextTurn === 'w' ? 'White' : 'Black';

            let nextisGameOver = false;
            let nextMessage = '';
            if (Chess.hasValidMoves(nextTurn, chess)){
                nextMessage = isKingInCheck ? `${nextColorText} in check!` : '';
            }else{//gameover: either checkmate or stalemate
                nextMessage = isKingInCheck ? `${currentColorText} wins!` : 'Stalemate';
                nextisGameOver = true;
            }

            return {
                fullMoveClock: nextFullMoveClock, 
                selected: null,
                turn: nextTurn,
                moveMap: {},
                boards: [...prevGameState.boards, chess.toString()],
                boardIndex: prevGameState.boards.length,
                message: nextMessage,
                isGameOver: nextisGameOver
            };
        });
    }

    const navigateToRecordedBoard = (step) => {
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                boardIndex: step,
                moveMap: {},
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
        justifyContent: 'space-between',
    }

    let turnColor = turn === 'w' ? 'White' : 'Black';
    let turnString = `${player === turn ? 'Your' : `Computer's`} turn (${turnColor})`;
    console.log(`PAWN PROMOTION: ${showPawnPromotionPopup}`);
    //console.log(boards);
    //console.log(boardIndex);
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
                        let moveMap = possibleMoves.reduce((map, move) => {
                            map[move] = move;
                            return map;
                        }, {});
                        //permit board to highlight selected piece, along with its possible moves
                        setGameState(prevGameState => {
                            return {
                                ...prevGameState,
                                selected: index,
                                moveMap: moveMap
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
            <PlayerCard name='Bill' />
            {Boolean(showPawnPromotionPopup) && (
                <PawnPromotion 
                    promote={(promotion) => {
                        chess.promotePawn(promotion);
                        concludeTurn();
                    }}
                />
            )}
        </div>
    );
}
export default Game;