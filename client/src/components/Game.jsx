import React from 'react';

import Header from './Header.jsx';
import Board from './Board.jsx';
import Footer from './Footer.jsx';

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isPlayerWhite: true,
            isBoardReversed: false,
            boards: ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'],//list of board FEN strings
            boardIndex: 0,//which board in boards[] to view when looking at prev moves
            moves: [],//algebraic move strings
        }
        this.worker = new Worker('stockfish.js');
    }

    componentDidMount(){
        this.worker.onmessage = function(oEvent) {
            console.log('Worker said : ' + oEvent.data);
        };
        //this.worker.postMessage('uci');
        this.worker.postMessage('ucinewgame');
        this.worker.postMessage('isready');
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
            boards, 
            boardIndex, 
            isBoardReversed,
        } = this.state;

        return(
            <div style={root}>
                <Header />
                <Board
                    board={boards[boardIndex]}
                    isReversed={isBoardReversed}
                />
                <Footer />
            </div>
        );
    }
}
export default Game;