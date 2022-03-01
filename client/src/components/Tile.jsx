import React from 'react';

import imageRouter from '../utilities/imageRouter.js';

class Tile extends React.Component{
    render(){
        const { 
            position, 
            backgroundColor, 
            symbol,
            setSelected,
        } = this.props;

        const square = {
            float: 'left',
            position: 'relative',
            width: '12%',
            paddingBottom: '12%', /* = width for a 1:1 aspect ratio */
            margin: '0.25%',
            backgroundColor: backgroundColor,
            overflow: 'hidden',
        };
        const content = {
            position: 'absolute',
            height: '90%', /* = 100% - 2*5% padding */
            width: '90%', /* = 100% - 2*5% padding */
            padding: '5%',
        };
        const table = {
            display: 'table',
            width: '100%',
            height: '100%',
        };
        const tableCell = {
            display: 'flex',
            verticalAlign: 'middle',
        };
        const image = {
            width: '100%',
        }
        return (
            <div 
                style={square}
                onClick={setSelected}
            >
                <div style={content}>
                    <div style={table}>
                        <div style={tableCell}>
                            <img style={image} src={imageRouter[symbol]}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Tile;