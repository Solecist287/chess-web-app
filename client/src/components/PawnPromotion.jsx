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
        position: 'relative',
        margin: '0 auto',
        width: 'max-content',
        maxHeight: '70vh',
        marginTop: 'calc(100vh - 85vh - 20px)',
        background: '#fff',
        borderRadius: '4px',
        padding: '20px',
        border: '1px solid #999',
        overflow: 'auto',
    };

    const img = {
        'height': 'auto',
        'width': 'auto',
    };

    let images = Object.keys(imageRouter).filter(key => {
        return color === 'w' 
            ? key === key.toUpperCase() && key !== 'K' && key !== 'P'
            : key === key.toLowerCase() && key !== 'k' && key !== 'p'
    });
    return(
        <div style={root}>
            <div style={box}>
                {images.map(key => (
                    <img key={`promotion-image-${key}`} src={imageRouter[key]} onClick={() => promote(key.toLowerCase())}/>
                ))}
            </div>
        </div>
    )
}
export default PawnPromotion;