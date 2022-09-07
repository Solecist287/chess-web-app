import React, { useState, useEffect, } from 'react';
import { useLocation, } from 'react-router-dom';

import Chess from '../utilities/chess.js';
import { sanToIndex, EMPTY_SQUARE, NUM_COLS, NUM_ROWS } from '../utilities/utilities.js';

import PlayerCard from './PlayerCard.jsx';
import Board from './Board.jsx';
import PawnPromotion from './PawnPromotion.jsx';
//TODO: generic turncolor function
const colorAsText = (turn) => turn === 'w' ? 'White' : 'Black';

let worker = null;

const Game = (props) => {
    const [isEngineReady, setIsEngineReady] = useState(false);
    
    const [chess] = useState(new Chess());

    let location = useLocation();
    const {
        player = 'w',
        showLegalMoves = true,
    } = location.state;
    
    const [gameState, setGameState] = useState({
        turn: 'w',
        selected: null,//piece to move
        isBoardReversed: player === 'b' ? true : false,
        legalMoveMap: {},//map of nums range (0-63), includes clicked piece and its possible moves
        boards: [chess.toString()],//list of board strings i.e. arr[64], uses boardIndex
        boardMoves: [{}],//list of movemaps, uses boardIndex
        boardIndex: 0,//which board in boards[] to view when looking at prev moves
        fullMoveClock: 1,
        message: `${player === 'w' ? 'Your' : `Computer's`} turn, ${colorAsText('w')}`,
        isGameOver: false,
        warningMap: {},
    });
    //pawn promotion popu: 0 should be safe value, initial value chosen due being falsy
    const [pawnPromotionPopupIndex, setPawnPromotionPopupIndex] = useState(0);
    
    const {
        turn,
        selected,
        isBoardReversed,
        legalMoveMap,
        boards,
        boardMoves,
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
        console.log('mount');
        worker = new Worker(`${process.env.PUBLIC_URL}/stockfish.js`)
        //mount: setup comms with stockfish engine
        window.addEventListener('message', relayEngineResponse);
        worker.onmessage = function(oEvent) {
            //console.log('Worker said : ' + oEvent.data);
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
        console.log(oEvent.data);
        //console.log(typeof oEvent.data);
        if (typeof oEvent.data === 'string'){
            let selectedSan = String(oEvent.data).substring(0,2);
            let destinationSan = String(oEvent.data).substring(2,4);
            let promotion = String(oEvent.data).charAt(4);
            concludeTurn(sanToIndex(selectedSan), sanToIndex(destinationSan), promotion);
        }
    }

    //increment/reset state, set game state flags for next turn
    const concludeTurn = (selected, destination, promotion=null) => {
        console.log(`sel: ${selected}, dest: ${destination}, promotion: ${promotion}`)
        chess.pushIndexMove(selected, destination);
        if (promotion){
            chess.promotePawn(promotion);
        }

        const nextBoardMoveMap = {};
        nextBoardMoveMap[selected] = selected;
        nextBoardMoveMap[destination] = destination;
        
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
                legalMoveMap: {},
                boards: [...prevGameState.boards, chess.toString()],
                boardMoves: [...prevGameState.boardMoves, nextBoardMoveMap],
                boardIndex: prevGameState.boards.length,
                message: nextMessage,
                isGameOver: nextisGameOver,
                warningMap: nextWarningMap
            };
        });
    }

    const navigateToRecordedBoard = (direction) => {
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                boardIndex: direction === 'prev' ? prevGameState.boardIndex - 1 : prevGameState.boardIndex + 1,
                legalMoveMap: {},
                warningMap: {},
                selected: null,
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
                disabled={!(player === turn && boardIndex === boards.length - 1) || isGameOver}
                selected={selected}
                lastMoveMap={boardMoves[boardIndex]}
                legalMoveMap={showLegalMoves ? legalMoveMap : {}}
                warningMap={warningMap}
                onSelection={(index, symbol) => {
                    if (index === selected) {return;}
                    let isPlayerWhite = player === 'w';
                    let isSymbolUpperCase = symbol === symbol.toUpperCase();
                    //if move is in movemap
                    if (index in legalMoveMap){
                        if (!Chess.wouldIndexMovePutKingInCheck(selected, index, player, chess)){
                            //if pawn promotion...
                            //console.log(`symbol ${symbol}, iswhite ${isPlayerWhite}, index ${index}`)
                            let isSelectedAPawn = selected && boards[boardIndex].charAt(selected).toLowerCase() === 'p';
                            if (isSelectedAPawn && ((isPlayerWhite && index < NUM_COLS)||(!isPlayerWhite && index > 55))){
                                setPawnPromotionPopupIndex(index);
                            }else{
                                concludeTurn(selected, index, null);
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
                        let legalMoveMap = possibleMoves.reduce((map, move) => {
                            map[move] = move;
                            return map;
                        }, {});
                        //permit board to highlight selected piece, along with its possible moves
                        setGameState(prevGameState => {
                            return {
                                ...prevGameState,
                                selected: index,
                                destination: null,
                                legalMoveMap: legalMoveMap
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
                    onClick={() => navigateToRecordedBoard('prev')}
                >
                    prev
                </button>
                <button 
                    onClick={() => setGameState(prevGameState => {
                        return {
                            ...prevGameState, 
                            isBoardReversed: !prevGameState.isBoardReversed
                        };
                    })}
                >
                    flip
                </button>
                <button
                    disabled={boardIndex >= boards.length - 1} 
                    onClick={() => navigateToRecordedBoard('next')}
                >
                    next
                </button>
            </div>
            <PlayerCard name={isPlayerOnTop ? 'Computer' : 'Me'} />
            {Boolean(pawnPromotionPopupIndex) && (
                <PawnPromotion
                    color={turn} 
                    promote={(promotion) => {
                        setPawnPromotionPopupIndex(0);
                        concludeTurn(selected, pawnPromotionPopupIndex, promotion);
                    }}
                />
            )}
        </div>
    );
}
export default Game;