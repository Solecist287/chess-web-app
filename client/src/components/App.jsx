import React, { useState, useEffect } from 'react';
import{Link} from "react-router-dom";


const App = () => {
    const [startingColor, setStartingColor] = useState('w');
    const [showLegalMoves, setShowLegalMoves] = useState(true);
    console.log(showLegalMoves)
    const root = {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        //justifyContent: 'center',
        alignItems: 'center'
    };

    const colorSelection = {
        display: 'flex',
        flexDirection: 'row',
    };

    const colorRadioButtons = {
        display: 'flex',
        flexDirection: 'row',
    }

    const startGameButton = {
        backgroundColor: 'black',
        color: 'white',
        padding: '10px 15px',
        textDecoration: 'none',
    };

    return (
        <form style={root}>
            Welcome to Stockfish Chess!
            <div style={colorSelection}>
                Choose starting color
                <div style={colorRadioButtons}>
                    <label>
                        <input
                            type="radio"
                            name="White"
                            value={'w'}
                            checked={startingColor === 'w'}
                            onChange={() => setStartingColor('w')}
                        />
                        White
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="Black"
                            value={'b'}
                            checked={startingColor === 'b'}
                            onChange={() => setStartingColor('b')}
                        />
                        Black
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="Random"
                            value={'r'}
                            checked={startingColor === 'r'}
                            onChange={() => setStartingColor('r')}
                        />
                        Random
                    </label>
                </div>
            </div>
            <label>
                Show legal moves
                <input 
                    type='checkbox' 
                    value={showLegalMoves}
                    checked={showLegalMoves}
                    onChange={() => setShowLegalMoves(!showLegalMoves)}
                />
            </label>
            <Link
                style={startGameButton}
                role='button'
                type='button'
                to={{pathname: '/game'}}
                state={{
                    player: startingColor === 'r' ? ['w', 'b'][Math.floor(Math.random() * 2)] : startingColor,
                    showLegalMoves: showLegalMoves
                }}
            >
                Start game
            </Link>
        </form>
    );
}
export default App;