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
        this.worker = new Worker('stockfish.js');
        this.chessboard = new Chessboard();
    }

    componentDidMount(){
        const { boards, boardIndex, } = this.state;

        this.worker.onmessage = function(oEvent) {
            console.log('Worker said : ' + oEvent.data);
        };
        //this.worker.postMessage('uci');
        this.worker.postMessage('ucinewgame');
        this.worker.postMessage('isready');
        let boardString = this.chessboard.toString();
        this.setState({
            boards: [...boards, boardString],
            boardIndex: boardIndex + 1
        });
    }

    componentWillUnmount(){
        this.worker.terminate();
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
                        let isPlayerWhite = player === 'w';
                        let isSymbolUpperCase = symbol === symbol.toUpperCase();
                        if (symbol != EMPTY_SQUARE && isPlayerWhite === isSymbolUpperCase){
                            this.setState({selected: index});
                        }else{
                            this.setState({selected: null});
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