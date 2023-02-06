// react
import React, { useState, useEffect, } from 'react';
import './Game.css';
//hooks
import { useParams, } from 'react-router-dom';
//utils
import * as Chess from '../../utils/chess';
import { indexToCoords, sanToIndex, coordsToIndex } from '../../utils/coords';
import { WHITE, BLACK, EMPTY_SQUARE } from '../../utils/constants';
//components
import Board from '../Board/Board';
import PawnPromotion from '../PawnPromotion/PawnPromotion';

const colorAsText = (turn: string) => turn === WHITE ? 'White' : 'Black';

let INITIAL_BOARD = Chess.createInitialBoard();

const Game = () => {
    //status of chess engine
    const [isEngineReady, setIsEngineReady] = useState(false);
    //game parameters from url
    const {
        player = WHITE,
        showPseudoLegalMoves = 'show-moves',
    } = useParams();

    const [gameState, setGameState] = useState({
        board: INITIAL_BOARD, //2d array of Piece objs
        turn: WHITE,
        selected: -1,//piece to move
        lastMoved: -1,
        isBoardReversed: player === BLACK ? true : false,
        pseudoLegalMoveMap: {},//map of nums range (0-63), includes clicked piece and its possible moves
        boards: [Chess.boardToString(INITIAL_BOARD)],//list of board strings i.e. arr[64], uses boardIndex
        boardMoves: [{}],//list of movemaps, uses boardIndex
        boardIndex: 0,//which board in boards[] to view when looking at prev moves
        fullMoveClock: 1,
        message: `${player === WHITE ? 'Your' : `Computer's`} turn, ${colorAsText(WHITE)}`,
        isGameOver: false,
        warningMap: {},
    });
    
    const {
        board,
        turn,
        selected,
        lastMoved,
        isBoardReversed,
        pseudoLegalMoveMap,
        boards,
        boardMoves,
        boardIndex,
        fullMoveClock,
        message,
        isGameOver,
        warningMap,
    } = gameState;

    //pawn promotion popu: 0 should be safe value, initial value chosen due being falsy
    const [pawnPromotionPopupIndex, setPawnPromotionPopupIndex] = useState(-1);
   
    //didmount (set stockfish listener) and didupdate (game state changes)
    useEffect(() => {
        //UPDATE TURN: call engine if computer's turn
        if (isEngineReady && player !== turn){
            console.log('ask robot')
            const [lastMovedRow, lastMovedCol] = indexToCoords(lastMoved);
            let fen = Chess.generateFen(board, turn, fullMoveClock, lastMovedRow, lastMovedCol);
            let endpoint = `http://localhost:8080/engine/fen/${encodeURIComponent(fen)}`;
            fetch(endpoint)
            .then(res => res.json())
            .then(json => {
                let sanMove = json['sanMove'];
                let selectedSan = sanMove.substring(0,2);
                let destinationSan = sanMove.substring(2,4);
                let promotion = sanMove.charAt(4);
                concludeTurn(sanToIndex(selectedSan), sanToIndex(destinationSan), promotion);
            })
        }
    }, [gameState, isEngineReady]);

    //unmount for removing stockfish listener
    useEffect(() => {
        console.log('mount');
        fetch('http://localhost:8080/engine/new-game')
        .then(res => res.json())
        .then(json => {
            if (json['status'] === 'readyok'){
               setIsEngineReady(true) 
            }
        })
        .catch(err => {
            console.log(err);
            setIsEngineReady(false);
        });
    }, []);

    //increment/reset state, set game state flags for next turn
    const concludeTurn = (selected: number, destination: number, promotion='') => {
        // console.log(`sel: ${selected}, dest: ${destination}, promotion: ${promotion}`)
        let [selectedRow, selectedCol] = indexToCoords(selected);
        let [destinationRow, destinationCol] = indexToCoords(destination);
        
        setGameState(prevGameState => { 
            let nextBoard = Chess.pushMove(prevGameState.board, selectedRow, selectedCol, destinationRow, destinationCol);
            if (promotion){
                nextBoard = Chess.pushPawnPromotion(nextBoard, destinationRow, destinationCol, promotion);
                setPawnPromotionPopupIndex(-1);
            }
            const nextBoardMoveMap : { [key: string]: number } = {};
            nextBoardMoveMap[selected] = selected;
            nextBoardMoveMap[destination] = destination;

            const nextTurn = prevGameState.turn === WHITE ? BLACK : WHITE;
            // console.log(`now: ${prevGameState.turn}, next: ${nextTurn}`);
            //increment full move clock when black concludes turn
            let nextFullMoveClock = prevGameState.turn === BLACK ? prevGameState.fullMoveClock + 1 : prevGameState.fullMoveClock;

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
            let nextWarningMap : { [key: string]: number } = {};
            if (isKingInCheck){
                nextWarningMap[nextTurnKingIndex] = nextTurnKingIndex;
            }

            return {
                board: nextBoard,
                fullMoveClock: nextFullMoveClock, 
                selected: -1,
                lastMoved: destination,
                isBoardReversed: prevGameState.isBoardReversed,
                turn: nextTurn,
                pseudoLegalMoveMap: {},
                boards: [...prevGameState.boards, Chess.boardToString(nextBoard)],
                boardMoves: [...prevGameState.boardMoves, nextBoardMoveMap],
                boardIndex: prevGameState.boards.length,
                message: nextMessage,
                isGameOver: nextisGameOver,
                warningMap: nextWarningMap
            };
        });
    }

    const navigateToRecordedBoard = (index: number) => {
        setGameState(prevGameState => {
            return {
                ...prevGameState,
                boardIndex: index
            };
        });
    }

    // const isPlayerOnTop = (player === BLACK && !isBoardReversed) || (player === WHITE && isBoardReversed);

    const isAtCurrentBoard = Boolean(boardIndex === boards.length - 1);

    return(
        <div className='Game'>
            <h2 style={{'margin': '0 auto'}}>{ `${message}`}</h2>
            <Board
                disabled={player !== turn || !isAtCurrentBoard || isGameOver}
                board={boards[boardIndex]}
                isReversed={isBoardReversed}
                selected={isAtCurrentBoard ? selected : -1}
                lastMoveMap={boardMoves[boardIndex]}
                pseudoLegalMoveMap={showPseudoLegalMoves === 'show-moves' && isAtCurrentBoard ? pseudoLegalMoveMap : {}}
                warningMap={isAtCurrentBoard ? warningMap : {}}
                onSelection={(index: number , symbol: string) => {
                    if (index === selected) {return;}
                    let isPlayerWhite = player === WHITE;
                    let isSymbolUpperCase = symbol === symbol.toUpperCase();
                    //if move is in movemap
                    if (index in pseudoLegalMoveMap){
                        const [selectedRow, selectedCol] = indexToCoords(selected);
                        const [destinationRow, destinationCol] = indexToCoords(index);
                        if (!Chess.wouldMovePutKingInCheck(board, player, selectedRow, selectedCol, destinationRow, destinationCol)){
                            //if pawn promotion...
                            //console.log(`symbol ${symbol}, iswhite ${isPlayerWhite}, index ${index}`)
                            if (Chess.shouldPromotePawn(board, player, selectedRow, selectedCol, destinationRow, destinationCol)){
                                setPawnPromotionPopupIndex(index);
                            }else{
                                concludeTurn(selected, index, '');
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
                        let pseudoLegalMoveMap = possibleMoves.reduce((map: { [key: string]: number }, move) => {
                            map[move] = move;
                            return map;
                        }, {});
                        //permit board to highlight selected piece, along with its possible moves
                        setGameState(prevGameState => {
                            return {
                                ...prevGameState,
                                selected: index,
                                pseudoLegalMoveMap: pseudoLegalMoveMap
                            };
                        });
                    }
                }}
            />
            <div className='Board-actions'>
                <button 
                    className='Board-button'
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
                    className='Board-button'
                    disabled={boardIndex <= 0} 
                    onClick={() => navigateToRecordedBoard(0)}
                >
                    <i className="fa-solid fa-backward-fast"></i>
                </button>
                <button
                    className='Board-button'
                    disabled={boardIndex <= 0} 
                    onClick={() => navigateToRecordedBoard(boardIndex - 1)}
                >
                    <i className="fa-solid fa-backward"></i>
                </button>
                <button
                    className='Board-button'
                    disabled={isAtCurrentBoard} 
                    onClick={() => navigateToRecordedBoard(boardIndex + 1)}
                >
                    <i className="fa-solid fa-forward"></i>
                </button>
                <button
                    className='Board-button'
                    disabled={isAtCurrentBoard} 
                    onClick={() => navigateToRecordedBoard(boards.length - 1)}
                >
                    <i className="fa-solid fa-forward-fast"></i>
                </button>
            </div>
            
            {Boolean(pawnPromotionPopupIndex !== -1) && (
                <PawnPromotion
                    color={turn} 
                    promote={(promotion: string) => concludeTurn(selected, pawnPromotionPopupIndex, promotion)}
                />
            )}
        </div>
    );
}
export default Game;