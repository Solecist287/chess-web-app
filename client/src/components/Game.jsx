import React from 'react';

import Chessboard from '../utilities/chessboard.js';
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
        }
        //this.worker = new Worker('stockfish.js');
        this.chessboard = new Chessboard();
    }

    componentDidMount(){
        const { boards, boardIndex, } = this.state;

        //this.worker.onmessage = function(oEvent) {
        //    console.log('Worker said : ' + oEvent.data);
        //};
        //this.worker.postMessage('uci');
        //this.worker.postMessage('ucinewgame');
        //this.worker.postMessage('isready');
        let boardString = this.chessboard.toString();
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
        } = this.state;

        let turnColor = turn === 'w' ? 'White' : 'Black';
        let turnString = `${player === turn ? 'Your' : `Computer's`} turn (${turnColor})`;
        return(
            <div style={root}>
                <div>{ `Player vs Stockfish! ${turnString}`}</div>
                <Header />
                <Board
                    disabled={player !== turn}
                    selected={selected}
                    moveMap={moveMap}
                    onSelection={(index, symbol) => {
                        if (index === selected) {return;}
                        let isPlayerWhite = player === 'w';
                        let isSymbolUpperCase = symbol === symbol.toUpperCase();
                        //if move is in movemap
                        if (index in moveMap){
                            this.chessboard.pushIndexMove(selected, index);
                            this.setState({
                                selected: null,
                                turn: turn === 'w' ? 'b': 'w',
                                player: player === 'w' ? 'b' : 'w',//remove later
                                moveMap: {},
                                boards: [...boards, this.chessboard.toString()],
                                boardIndex: boardIndex + 1
                            });
                        }
                        //only select square where it has a piece you own
                        else if (symbol !== EMPTY_SQUARE && isPlayerWhite === isSymbolUpperCase){
                            //generate possible moves for movemap
                            let possibleMoves = Chessboard.generateMovesFromIndex(index, this.chessboard);
                            let moveMap = possibleMoves.reduce((map, move) => {
                                map[move] = move;
                                return map;
                            }, {});
                            //permit board to highlight selected piece, along with its possible moves
                            this.setState({
                                selected: index,
                                moveMap: moveMap
                            });
                        }else{//blank square
                            this.setState({selected: null, moveMap: {}});
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