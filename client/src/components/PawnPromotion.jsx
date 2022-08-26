import React from 'react';
import imageRouter from '../utilities/imageRouter.js';

const PawnPromotion = (props) => {

    const { color, promote, } = props;

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
        'margin': '0 auto',
        'width': 'max-content',
        'max-height': '70vh',
        'margin-top': 'calc(100vh - 85vh - 20px)',
        'background': '#fff',
        'border-radius': '4px',
        'padding': '20px',
        'border': '1px solid #999',
        'overflow': 'auto',
    };

    const img = {
        'height': 'auto',
        'width': 'auto',
    };

    return(
        <div style={root}>
            <div style={box}>
                {Object.keys(imageRouter).filter(key => color === 'w' ? key === key.toUpperCase() : key === key.toLowerCase()).map(key => (
                    <img src={imageRouter[key]}/>
                ))}
            </div>
        </div>
    )
}
export default PawnPromotion;