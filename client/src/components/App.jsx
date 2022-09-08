import React, { useState } from 'react';
import{Link} from "react-router-dom";


const App = () => {
    const [startingColor, setStartingColor] = useState('w');
    const [showLegalMoves, setShowLegalMoves] = useState(true);
    const root = {
        margin: 10,
        height: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const title = {
        fontSize: '3em',
    };

    const settings = {
        padding: 10,
        fontSize: '1em',
        border: '1px solid'
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
            <h1 style={title}>
                Welcome to Stockfish Chess!
            </h1>
            <table style={settings}>
                <tr>
                    <td>
                        Choose starting color  
                    </td>
                    <td>
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
                    </td>            
                
                </tr>
                <tr>
                    <td>
                        Show pseudo-legal moves
                    </td>
                    <td>
                        <input 
                            type='checkbox' 
                            value={showLegalMoves}
                            checked={showLegalMoves}
                            onChange={() => setShowLegalMoves(!showLegalMoves)}
                        />
                    </td>
                </tr>
            </table>

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