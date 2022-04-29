import React from 'react';

class PawnPromotion extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }
    render(){
        const root = {
            position: 'fixed',
            background: '#00000050',
            width: '100%',
            height: '100vh',
            top: 0,
            left: 0,
        };
           
        const box = {
            'position': 'relative',
            'width': '70%',
            'margin': '0 auto',
            'height': 'auto',
            'max-height': '70vh',
            'margin-top': 'calc(100vh - 85vh - 20px)',
            'background': '#fff',
            'border-radius': '4px',
            'padding': '20px',
            'border': '1px solid #999',
            'overflow': 'auto',
        };

        return(
            <div style={root}>
                <div style={box}>
                    Pawn promotion: select a piece
                </div>
            </div>
        );
    }
}
export default PawnPromotion;