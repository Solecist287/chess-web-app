import {React, Component, Fragment} from 'react';
import Tile from './Tile.jsx';

import { NUM_ROWS, NUM_COLS } from '../utilities/utilities.js';

let rankList = [8, 7, 6, 5, 4, 3, 2, 1];//top to bottom (numbers)
let fileList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];//left to right (letters)

function invertIndex(index){
    return Math.abs(index - (NUM_COLS * NUM_ROWS - 1));
}

class Board extends Component{
    constructor(props){
        super(props);
        this.state = {
        }
    }

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
            board, 
            isReversed,
            highlightedMap,
            onSelection,
        } = this.props;
        //immutably flip inputs if isReversed
        let ranks = isReversed ? rankList.reverse() : rankList;
        let files = isReversed ? fileList.reverse() : fileList;

        let boardOriented = [];
        if (board && board.length){
            let boardArr = board.split('');
            boardOriented = isReversed ? boardArr.reverse(): boardArr;
        }
        let highlightedMapOriented = {};
        if (isReversed){
            Object.keys(highlightedMap).forEach(key => {
                let flippedIndex = invertIndex(key);
                highlightedMapOriented[flippedIndex] = flippedIndex;
            });
        }else{
            highlightedMapOriented = highlightedMap;
        }
        return(
            <div style={root}>
                {boardOriented.map((symbol, index) => {
                    let row = Math.trunc(index/NUM_ROWS);
                    let rank = ranks[row];
                    let col = index%NUM_COLS;
                    let file = files[col];
                    let isLightSquare = Boolean(row % 2 === col % 2);
                    let backgroundColor = index in highlightedMapOriented ? highlighted : isLightSquare ? lightSquare : darkSquare;
                    let absoluteIndex = isReversed ? invertIndex(index) : index;//right side up
                    return (
                        <Fragment key={`${rank}-${file}`}>
                            <Tile
                                position={`${file}${rank}`}
                                backgroundColor={backgroundColor}
                                symbol={symbol}
                                onSelection={() => !disabled && onSelection(absoluteIndex, symbol)}
                            />
                        </Fragment>
                    );
                })}
            </div>
        );
    }
}
export default Board;