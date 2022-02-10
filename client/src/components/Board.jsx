import React from 'react';
import Tile from './Tile.jsx';
class Board extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tiles: []
        }
    }
    renderTiles(rowNum, colNum){
        const tiles = [];
        for (let i = 0; i < rowNum; i++){
            for (let j = 0; j < colNum; j++){
                tiles.push(<Tile row={i} col={j} />);
            }
        }
        return tiles;
    }
    render(){
        const root = {
            maxWidth: '80vh',
            maxHeight: '80vh'
        };
        return(
            <div style={root}>
                {this.renderTiles(8,8)}
            </div>
        );
    }
}
export default Board;