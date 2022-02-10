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