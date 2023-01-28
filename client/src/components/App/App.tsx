// react
import React, { useState } from 'react';
import './App.css';
// components
import{ Link } from "react-router-dom";
// utils
import { WHITE, BLACK, RANDOM } from '../../utils/constants';

const randomColor = () => [WHITE, BLACK][Math.floor(Math.random() * 2)];

const App = () => {
    const [startingColor, setStartingColor] = useState(WHITE);
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
                                    checked={startingColor === WHITE}
                                    onChange={() => setStartingColor(WHITE)}
                                />
                                White
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="Black"
                                    checked={startingColor === BLACK}
                                    onChange={() => setStartingColor(BLACK)}
                                />
                                Black
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="Random"
                                    checked={startingColor === RANDOM}
                                    onChange={() => setStartingColor(RANDOM)}
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
                    player: startingColor === RANDOM ? randomColor() : startingColor,
                    showLegalMoves: showLegalMoves
                }}
            >
                Start game
            </Link>
        </form>
    );
}
export default App;