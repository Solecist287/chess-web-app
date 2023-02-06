// react
import React, { useState } from 'react';
import './App.css';
// hooks
import { useNavigate } from "react-router-dom";
// components
import{ Link } from "react-router-dom";
// utils
import { WHITE, BLACK, RANDOM } from '../../utils/constants';

const randomColor = () => [WHITE, BLACK][Math.floor(Math.random() * 2)];

const App = () => {
    const [startingColor, setStartingColor] = useState(WHITE);
    const [showPseudoLegalMoves, setShowPseudoLegalMoves] = useState(true);
    const navigate = useNavigate();
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
                            checked={showPseudoLegalMoves}
                            onChange={() => setShowPseudoLegalMoves(!showPseudoLegalMoves)}
                        />
                    </td>
                </tr>
            </table>

            <button
                className='Start-game-button'
                onClick={() => {
                    const player = startingColor === RANDOM ? randomColor() : startingColor;
                    const showMoves = showPseudoLegalMoves ? 'show-moves' : 'hide-moves';
                    navigate(`/game/${player}/${showMoves}`);
                }}
            >
                Start game
            </button>
        </form>
    );
}
export default App;