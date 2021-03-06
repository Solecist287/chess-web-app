import {React, Component, Fragment} from 'react';
import Tile from './Tile.jsx';

import { indexToCoords, RANKS, FILES, NUM_ROWS, NUM_COLS } from '../utilities/utilities.js';

function invertIndex(index){
    return Math.abs(index - (NUM_COLS * NUM_ROWS - 1));
}

class Board extends Component{
    render(){
        const root = {
            maxWidth: '80vh',
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
            moveMap,
            onSelection,
        } = this.props;
        //immutably flip inputs if isReversed
        let ranks = isReversed ? RANKS.reverse() : RANKS;
        let files = isReversed ? FILES.reverse() : FILES;

        let selectedOriented = isReversed && selected ? invertIndex(selected) : selected;

        let boardOriented = [];
        if (board && board.length){
            let boardArr = board.split('');
            boardOriented = isReversed ? boardArr.reverse(): boardArr;
        }
        let moveMapOriented = {};
        if (isReversed){
            Object.keys(moveMap).forEach(key => {
                let flippedIndex = invertIndex(key);
                moveMapOriented[flippedIndex] = flippedIndex;
            });
        }else{
            moveMapOriented = moveMap;
        }
        return(
            <div style={root}>
                {boardOriented.map((symbol, index) => {
                    let [row, col] = indexToCoords(index);
                    let rank = ranks[row];
                    let file = files[col];
                    let isLightSquare = Boolean(row % 2 === col % 2);
                    let backgroundColor = index === selectedOriented || index in moveMapOriented ? highlighted : isLightSquare ? lightSquare : darkSquare;
                    let absoluteIndex = isReversed ? invertIndex(index) : index;//right side up
                    return (
                        <Fragment key={`${rank}-${file}`}>
                            <Tile
                                position={`${file}${rank}`}
                                backgroundColor={backgroundColor}
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
}
export default Board;