import {React, Component, Fragment} from 'react';
import Tile from './Tile.jsx';

import { NUM_ROWS, NUM_COLS } from '../utilities/utilities.js';

let rankList = [8, 7, 6, 5, 4, 3, 2, 1];//top to bottom (numbers)
let fileList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];//left to right (letters)

class Board extends Component{
    constructor(props){
        super(props);
        this.state = {
            selected: null,
        }
    }

    render(){
        const root = {
            maxWidth: '80vh',
            maxHeight: '80vh'
        };
        const darkSquare = '#D18B47';
        const lightSquare = '#FFCE9E';
        
        const { 
            board, 
            isReversed,
            highlighted = [],
        } = this.props;
        
        let ranks = isReversed ? rankList.reverse() : rankList;
        let files = isReversed ? fileList.reverse() : fileList;

        let boardOriented = [];
        if (board && board.length){
            let boardArr = board.split('');
            boardOriented = isReversed ? boardArr.reverse(): boardArr;
        }
        
        console.log(this.state.selectedIndex);

        return(
            <div style={root}>
                {boardOriented.map((symbol, index) => {
                    let row = Math.trunc(index/NUM_ROWS);
                    let rank = ranks[row];
                    let col = index%NUM_COLS;
                    let file = files[col];
                    let isLightSquare = Boolean(row % 2 == col % 2);
                    let backgroundColor = isLightSquare ? lightSquare : darkSquare;
                    return (
                        <Fragment key={`${rank}-${file}`}>
                            <Tile
                                position={`${file}${rank}`}
                                backgroundColor={backgroundColor}
                                symbol={symbol}
                                setSelected={() => { this.setState({ selectedIndex: index })}}
                            />
                        </Fragment>
                    );
                })}
            </div>
        );
    }
}
export default Board;