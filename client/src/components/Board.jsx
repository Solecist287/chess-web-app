import { React, Fragment } from 'react';
import Tile from './Tile.jsx';

import { indexToCoords, RANKS, FILES, NUM_ROWS, NUM_COLS } from '../utilities/utilities.js';

function invertIndex(index){
    return Math.abs(index - (NUM_COLS * NUM_ROWS - 1));
}

const Board = (props) => {
    const root = {
        //paddingLeft: 'calc((100vw - 80vh) / 2)',
        margin: '0 auto',
        width: '80vh',
        maxHeight: '80vh'
    };
    const darkSquare = '#D18B47';
    const lightSquare = '#FFCE9E';
    const highlighted = '#72FCF1';

    const {
        disabled,
        selected,
        board, 
        isReversed, 
        validMoveMap,
        warningMap,
        onSelection,
    } = props;
    //immutably flip inputs if isReversed
    let ranks = isReversed ? RANKS.reverse() : RANKS;
    let files = isReversed ? FILES.reverse() : FILES;

    let selectedOriented = isReversed && selected ? invertIndex(selected) : selected;

    let boardOriented = [];
    if (board && board.length){
        let boardArr = board.split('');
        boardOriented = isReversed ? boardArr.reverse(): boardArr;
    }
    let validMoveMapOriented = {};
    let warningMapOriented = {};
    if (isReversed){
        Object.keys(validMoveMap).forEach(key => {
            let flippedIndex = invertIndex(key);
            validMoveMapOriented[flippedIndex] = flippedIndex;
        });
        Object.keys(warningMap).forEach(key => {
            let flippedIndex = invertIndex(key);
            warningMapOriented[flippedIndex] = flippedIndex;
        });
    }else{
        validMoveMapOriented = validMoveMap;
        warningMapOriented = warningMap;
    }
    return(
        <div style={root}>
            {boardOriented.map((symbol, index) => {
                let [row, col] = indexToCoords(index);
                let rank = ranks[row];
                let file = files[col];
                let isLightSquare = Boolean(row % 2 === col % 2);
                let backgroundColor = index === selectedOriented || index in validMoveMapOriented ? highlighted : isLightSquare ? lightSquare : darkSquare;
                let hasOutline = Boolean(index in warningMapOriented);
                let absoluteIndex = isReversed ? invertIndex(index) : index;//right side up
                return (
                    <Fragment key={`${rank}-${file}`}>
                        <Tile
                            position={`${file}${rank}`}
                            backgroundColor={backgroundColor}
                            hasOutline={hasOutline}
                            symbol={symbol}
                            onSelection={() => {
                                if (!disabled){//is enabled when it's your turn
                                    onSelection(absoluteIndex, symbol);
                                }
                            }}
                        />
                    </Fragment>
                );
            })}
        </div>
    );
}
export default Board;