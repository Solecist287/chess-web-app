import React from 'react';

import Chessboard from '../utilities/chessboard.js';

import Header from './Header.jsx';
import Board from './Board.jsx';
import Footer from './Footer.jsx';

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isPlayerWhite: true,
            isBoardReversed: false,
            boards: [],//list of board FEN strings
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
        })
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
                {/*<button style={{'height': 12}} onClick={() => this.setState({isBoardReversed: !this.state.isBoardReversed})}/>*/}
                <Footer />
            </div>
        );
    }
}
export default Game;