import React from 'react';

class Tile extends React.Component{
    render(){
        const square = {
            float: 'left',
            position: 'relative',
            width: '12%',
            paddingBottom: '12%', /* = width for a 1:1 aspect ratio */
            margin: '0.25%',
            backgroundColor: '#1E1E1E',
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
            display: 'table-cell',
            verticalAlign: 'middle',
        };
        return(
            <div style={square}>
                <div style={content}>
                    <div style={table}>
                        <div style={tableCell}>
                            PIECE
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Tile;