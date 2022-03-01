import {React, Component, Fragment} from 'react';
import Tile from './Tile.jsx';

import { unfoldFen } from '../utilities/utilities.js';

let rankList = [8, 7, 6, 5, 4, 3, 2, 1];//top to bottom (numbers)
let fileList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];//left to right (letters)

class Board extends Component{
    constructor(props){
        super(props);
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
        } = this.props;
        
        //console.log(board);
        let ranks = isReversed ? rankList.reverse() : rankList;
        let files = isReversed ? fileList.reverse() : fileList;
        let boardArr = unfoldFen(board, isReversed);
        //console.log(boardArr);
        return(
            <div style={root}>
                {ranks.map((rank, rindex) => (
                    files.map((file, findex) => {
                        let backgroundColor = (rindex % 2 == findex % 2) ? lightSquare : darkSquare;
                        let symbol = boardArr[rindex * 8 + findex];
                        return(
                            <Fragment key={`${rank}-${file}`}>
                                <Tile
                                    position={`${file}${rank}`}
                                    backgroundColor={backgroundColor}
                                    symbol={symbol}
                                />
                            </Fragment>
                        );
                    })
                ))}
            </div>
        );
    }
}
export default Board;