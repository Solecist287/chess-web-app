// react
import React, { Fragment } from 'react';
import './Board.css';
//utils
import { indexToCoords } from '../../utils/coords';
import { RANKS, FILES, NUM_ROWS, NUM_COLS } from '../../utils/constants';
//components
import Tile from '../Tile/Tile';

function invertIndex(index: number){
    return Math.abs(index - (NUM_COLS * NUM_ROWS - 1));
}

type BoardProps = {
    disabled: boolean;
    board: string;
    isReversed: boolean;
    selected: number;
    lastMoveMap: { [key: string]: number };
    legalMoveMap: { [key: string]: number };
    warningMap: { [key: string]: number };
    onSelection: (index: number , symbol: string) => void;
};

const Board = (props: BoardProps) => {

    const {
        disabled,
        selected,
        board, 
        isReversed, 
        lastMoveMap,
        legalMoveMap,
        warningMap,
        onSelection,
    } = props;
    //immutably flip inputs if isReversed
    let ranks = isReversed ? RANKS.reverse() : RANKS;
    let files = isReversed ? FILES.reverse() : FILES;

    let selectedOriented = isReversed && selected !== -1 ? invertIndex(selected) : selected;

    let boardOriented: string[] = [];
    if (board && board.length){
        let boardArr = board.split('');
        boardOriented = isReversed ? boardArr.reverse(): boardArr;
    
    }
    let lastMoveMapOriented: { [key: string]: number } = {};
    let legalMoveMapOriented: { [key: string]: number } = {};
    let warningMapOriented: { [key: string]: number } = {};
    if (isReversed){
        Object.keys(lastMoveMap).forEach(key => {
            let flippedIndex = invertIndex(lastMoveMap[key]);
            lastMoveMapOriented[flippedIndex] = flippedIndex;
        });
        Object.keys(legalMoveMap).forEach(key => {
            let flippedIndex = invertIndex(legalMoveMap[key]);
            legalMoveMapOriented[flippedIndex] = flippedIndex;
        });
        Object.keys(warningMap).forEach(key => {
            let flippedIndex = invertIndex(warningMap[key]);
            warningMapOriented[flippedIndex] = flippedIndex;
        });
    }else{
        lastMoveMapOriented = lastMoveMap;
        legalMoveMapOriented = legalMoveMap;
        warningMapOriented = warningMap;
    }

    return(
        <div className='Board'>
            {boardOriented.map((symbol, index) => {
                // console.log(`symbol ${symbol}, index: ${index}`)
                let [row, col] = indexToCoords(index);
                let rank = ranks[row];
                let file = files[col];
                let isLightSquare = Boolean(row % 2 === col % 2);
                let backgroundColorMode = 
                    index === selectedOriented || index in legalMoveMapOriented ? 'Selected' : 
                    index in lastMoveMapOriented ? 'Previous-selected' :
                    isLightSquare ? 'Light' : 
                    'Dark';
                let hasOutline = Boolean(index in warningMapOriented);
                let absoluteIndex = isReversed ? invertIndex(index) : index;//right side up
                return (
                    <Fragment key={`${rank}-${file}`}>
                        <Tile
                            backgroundColorMode={backgroundColorMode}
                            outlineMode={hasOutline ? 'Outlined' : ''}
                            symbol={symbol}
                            onClick={() => {
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