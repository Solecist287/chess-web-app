import React, { useState, useEffect, } from 'react';
import { useLocation, } from 'react-router-dom';

import * as Chess from '../utilities/chess.js';
import { indexToCoords, sanToIndex, EMPTY_SQUARE, NUM_COLS, coordsToIndex, } from '../utilities/utilities.js';

import PlayerCard from './PlayerCard.jsx';
import Board from './Board.jsx';
import PawnPromotion from './PawnPromotion.jsx';
//TODO: generic turncolor function
const colorAsText = (turn) => turn === 'w' ? 'White' : 'Black';

let worker = null;
let INITIAL_BOARD = Chess.createInitialBoard();

const Game = (props) => {
    //status of chess engine
    const [isEngineReady, setIsEngineReady] = useState(false);
    //game parameters from url
    const {
        player = 'w',
        showLegalMoves = true,
    } = useLocation().state;
    
    const [gameState, setGameState] = useState({
        board: INITIAL_BOARD, //2d array of Piece objs
        turn: 'w',
        selected: null,//piece to move
        lastMoved: null,
        isBoardReversed: player === 'b' ? true : false,
        legalMoveMap: {},//map of nums range (0-63), includes clicked piece and its possible moves
        boards: [Chess.boardToString(INITIAL_BOARD)],//list of board strings i.e. arr[64], uses boardIndex
        boardMoves: [{}],//list of movemaps, uses boardIndex
        boardIndex: 0,//which board in boards[] to view when looking at prev moves
        fullMoveClock: 1,
        message: `${player === 'w' ? 'Your' : `Computer's`} turn, ${colorAsText('w')}`,
        isGameOver: false,
        warningMap: {},
    });
    
    const {
        board,
        turn,
        selected,
        lastMoved,
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

    //pawn promotion popu: 0 should be safe value, initial value chosen due being falsy
    const [pawnPromotionPopupIndex, setPawnPromotionPopupIndex] = useState(0);
   
    //didmount (set stockfish listener) and didupdate (game state changes)
    useEffect(() => {
        //UPDATE TURN: call engine if computer's turn
        if (isEngineReady && player !== turn){
            console.log('ask robot')
            const [lastMovedRow, lastMovedCol] = indexToCoords(lastMoved);
            let fen = Chess.generateFen(board, turn, fullMoveClock, lastMovedRow, lastMovedCol);
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
            concludeTurn(sanToIndex(selectedSan), sanToIndex(destinationSan), promotion)
        }
    }

    //increment/reset state, set game state flags for next turn
    const concludeTurn = (selected, destination, promotion=null) => {
        console.log(`sel: ${selected}, dest: ${destination}, promotion: ${promotion}`)
        let [selectedRow, selectedCol] = indexToCoords(selected);
        let [destinationRow, destinationCol] = indexToCoords(destination);
        
        setGameState(prevGameState => { 
            let nextBoard = Chess.pushMove(prevGameState.board, selectedRow, selectedCol, destinationRow, destinationCol);
            if (promotion){
                nextBoard = Chess.pushPawnPromotion(nextBoard, destinationRow, destinationCol, promotion);
                setPawnPromotionPopupIndex(0);
            }
            const nextBoardMoveMap = {};
            nextBoardMoveMap[selected] = selected;
            nextBoardMoveMap[destination] = destination;

            const nextTurn = prevGameState.turn === 'w' ? 'b' : 'w';
            console.log(`now: ${prevGameState.turn}, next: ${nextTurn}`);
            //increment full move clock when black concludes turn
            let nextFullMoveClock = prevGameState.turn === 'b' ? prevGameState.fullMoveClock + 1 : prevGameState.fullMoveClock;

            let isKingInCheck = Chess.isKingInCheck(nextBoard, nextTurn);
            let currentColorText = colorAsText(prevGameState.turn);
            let nextColorText = colorAsText(nextTurn);

            let nextisGameOver = false;
            let nextMessage = '';

            const [lastMovedRow, lastMovedCol] = indexToCoords(lastMoved);

            if (Chess.hasValidMoves(nextBoard, nextTurn, lastMovedRow, lastMovedCol)){
                nextMessage = `${player === nextTurn ? 'Your' : `Computer's`} turn, ${nextColorText}`
            }else{//gameover: either checkmate or stalemate
                nextMessage = isKingInCheck ? `${currentColorText} wins!` : 'Stalemate';
                nextisGameOver = true;
            }
            let nextTurnKingIndex = Chess.getKingIndex(nextBoard, nextTurn);
            let nextWarningMap = {};
            if (isKingInCheck){
                nextWarningMap[nextTurnKingIndex] = nextTurnKingIndex;
            }

            return {
                board: nextBoard,
                fullMoveClock: nextFullMoveClock, 
                selected: null,
                lastMoved: destination,
                turn: nextTurn,
                legalMoveMap: {},
                boards: [...prevGameState.boards, Chess.boardToString(nextBoard)],
                boardMoves: [...prevGameState.boardMoves, nextBoardMoveMap],
                boardIndex: prevGameState.boards.length,
                message: nextMessage,
                isGameOver: nextisGameOver,
                warningMap: nextWarningMap
            };
        });
    }

    const navigateToRecordedBoard = (index) => {
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                boardIndex: index
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
        width: 'min(80vh, 80vw)',
        margin: '0 auto',
        padding: 10,
        //alignItems: 'center',
        justifyContent: 'center',
    }

    const button = {
        backgroundColor: 'black',
        border: 'none',
        color: 'white',
        padding: '10px 15px',
        fontSize: '1em',
        cursor: 'pointer',
    };

    const isPlayerOnTop = (player === 'b' && !isBoardReversed) || (player === 'w' && isBoardReversed);

    const isAtCurrentBoard = Boolean(boardIndex === boards.length - 1);

    return(
        <div style={root}>
            <h2 style={{'margin': '0 auto'}}>{ `${message}`}</h2>
            <PlayerCard name={isPlayerOnTop ? 'Me' : 'Computer'} />
            <Board
                disabled={!player === turn || !isAtCurrentBoard || isGameOver}
                selected={isAtCurrentBoard ? selected : {}}
                lastMoveMap={boardMoves[boardIndex]}
                legalMoveMap={showLegalMoves && isAtCurrentBoard ? legalMoveMap : {}}
                warningMap={isAtCurrentBoard ? warningMap : {}}
                onSelection={(index, symbol) => {
                    if (index === selected) {return;}
                    let isPlayerWhite = player === 'w';
                    let isSymbolUpperCase = symbol === symbol.toUpperCase();
                    //if move is in movemap
                    if (index in legalMoveMap){
                        const [selectedRow, selectedCol] = indexToCoords(selected);
                        const [destinationRow, destinationCol] = indexToCoords(index);
                        if (!Chess.wouldMovePutKingInCheck(board, player, selectedRow, selectedCol, destinationRow, destinationCol)){
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
                        const [indexRow, indexCol] = indexToCoords(index);
                        const [lastMovedRow, lastMovedCol] = indexToCoords(lastMoved);
                        //generate possible moves for movemap
                        let possibleMoves2d = Chess.generateMoves(board, lastMovedRow, lastMovedCol, indexRow, indexCol);
                        let possibleMoves = possibleMoves2d.map(coords2d => coordsToIndex(coords2d[0], coords2d[1]));
                        let legalMoveMap = possibleMoves.reduce((map, move) => {
                            map[move] = move;
                            return map;
                        }, {});
                        //permit board to highlight selected piece, along with its possible moves
                        setGameState(prevGameState => {
                            return {
                                ...prevGameState,
                                selected: index,
                                legalMoveMap: legalMoveMap
                            };
                        });
                    }
                }}
                board={boards[boardIndex]}
                isReversed={isBoardReversed}
            />
            <PlayerCard name={isPlayerOnTop ? 'Computer' : 'Me'} />
            <div style={buttonContainer}>
                <button 
                    style={button}
                    onClick={() => setGameState(prevGameState => {
                        return {
                            ...prevGameState, 
                            isBoardReversed: !prevGameState.isBoardReversed
                        };
                    })}
                >
                    <i className="fa-solid fa-rotate"></i>
                </button>
                <button
                    style={button}
                    disabled={boardIndex <= 0} 
                    onClick={() => navigateToRecordedBoard(0)}
                >
                    <i className="fa-solid fa-backward-fast"></i>
                </button>
                <button
                    style={button}
                    disabled={boardIndex <= 0} 
                    onClick={() => navigateToRecordedBoard(boardIndex - 1)}
                >
                    <i className="fa-solid fa-backward"></i>
                </button>
                <button
                    style={button}
                    disabled={isAtCurrentBoard} 
                    onClick={() => navigateToRecordedBoard(boardIndex + 1)}
                >
                    <i className="fa-solid fa-forward"></i>
                </button>
                <button
                    style={button}
                    disabled={isAtCurrentBoard} 
                    onClick={() => navigateToRecordedBoard(boards.length - 1)}
                >
                    <i className="fa-solid fa-forward-fast"></i>
                </button>
            </div>
            
            {Boolean(pawnPromotionPopupIndex) && (
                <PawnPromotion
                    color={turn} 
                    promote={(promotion) => concludeTurn(selected, pawnPromotionPopupIndex, promotion)}
                />
            )}
        </div>
    );
}
export default Game;