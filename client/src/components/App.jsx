import React, { useState, useEffect } from 'react';
import{Link} from "react-router-dom";


const App = (props) => {
    const [startingColor, setStartingColor] = useState('w');
    const [showLegalMoves, setShowLegalMoves] = useState(true);
    
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
        flexDirection: 'column'
    }

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
            <Link
                role='button'
                type='button'
                to={{pathname: '/game'}}
                state={{player: startingColor === 'r' ? ['w', 'b'][Math.floor(Math.random() * 2)] : startingColor,}}
            >
                Start game
            </Link>
        </form>
    );
}
export default App;