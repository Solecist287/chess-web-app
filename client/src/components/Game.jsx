import React from 'react';

import Chess from '../utilities/chess.js';
import { EMPTY_SQUARE } from '../utilities/utilities.js';

import Header from './Header.jsx';
import Board from './Board.jsx';
import Footer from './Footer.jsx';

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            turn: 'w',
            player: 'w',
            selected: null,
            isBoardReversed: false,
            moveMap: {},//map of nums range (0-63), includes clicked piece and its possible moves
            boards: [],//list of board strings i.e. arr[64]
            boardIndex: -1,//which board in boards[] to view when looking at prev moves
            moves: [],//algebraic move strings
            message: '',
            isGameOver: false,
        }
        //this.worker = new Worker('stockfish.js');
        this.chess = new Chess();
    }

    componentDidMount(){
        const { boards, boardIndex, } = this.state;

        //this.worker.onmessage = function(oEvent) {
        //    console.log('Worker said : ' + oEvent.data);
        //};
        //this.worker.postMessage('uci');
        //this.worker.postMessage('ucinewgame');
        //this.worker.postMessage('isready');
        let boardString = this.chess.toString();
        this.setState({
            boards: [...boards, boardString],
            boardIndex: boardIndex + 1
        });
    }

    componentWillUnmount(){
        //this.worker.terminate();
    }

    render(){
        const root = {
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        };

        const { 
            selected,
            turn,
            player,
            moveMap,
            boards, 
            boardIndex, 
            isBoardReversed,
            message,
            isGameOver,
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
                            if (!Chess.isKingInCheck(player, this.chess)){
                                this.chess.pushIndexMove(selected, index);
                                this.setState({
                                    selected: null,
                                    turn: turn === 'w' ? 'b': 'w',
                                    player: player === 'w' ? 'b' : 'w',//remove later
                                    moveMap: {},
                                    boards: [...boards, this.chess.toString()],
                                    boardIndex: boardIndex + 1,
                                    message: ''
                                });
                            }else{//king in check!
                                this.setState({
                                    message: 'King in check!'
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
                {
                    <button onClick={() => this.setState({isBoardReversed: !this.state.isBoardReversed})}>
                        flip!
                    </button>
                    }
                <Footer />
            </div>
        );
    }
}
export default Game;