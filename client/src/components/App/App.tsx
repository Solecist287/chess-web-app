// react
import React, { useState } from 'react';
import './App.css';
//components
import{ Link } from "react-router-dom";

const App = () => {
    const [startingColor, setStartingColor] = useState('w');
    const [showLegalMoves, setShowLegalMoves] = useState(true);

    return (
        <form className='App'>
            <h1 className='Title'>
                Welcome to Stockfish Chess!
            </h1>
            <table className='Settings'>
                <tr>
                    <td>
                        Choose starting color  
                    </td>
                    <td>
                        <div className='Color-radio-buttons'>
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
                            checked={showLegalMoves}
                            onChange={() => setShowLegalMoves(!showLegalMoves)}
                        />
                    </td>
                </tr>
            </table>

            <Link
                className='Start-game-button'
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