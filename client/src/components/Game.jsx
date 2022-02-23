import React from 'react';

import Header from './Header.jsx';
import Board from './Board.jsx';
import Footer from './Footer.jsx';

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isWhite: true,
            moves: [] 
        }
        this.worker = new Worker('stockfish.js');
    }

    componentDidMount(){
        this.worker.onmessage = function(oEvent) {
            console.log('Worker said : ' + oEvent.data);
        };
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
        return(
            <div style={root}>
                <Header />
                <Board />
                <Footer />
            </div>
        );
    }
}
export default Game;