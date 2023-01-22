import React from 'react';
import imageRouter from '../../utilities/imageRouter';

import './PawnPromotion.css';

type PawnPromotionProps = {
    color: string;
    promote: (promotion: string) => void;
};

const PawnPromotion = (props: PawnPromotionProps) => {

    const { color, promote, } = props;

    let images = Object.keys(imageRouter).filter(key => {
        return color === 'w' 
            ? key === key.toUpperCase() && key !== 'K' && key !== 'P'
            : key === key.toLowerCase() && key !== 'k' && key !== 'p'
    });
    return(
        <div className='Pawn-promotion'>
            <div className='Box'>
                {images.map(key => (
                    <img key={`promotion-image-${key}`} src={imageRouter[key]} onClick={() => promote(key.toLowerCase())}/>
                ))}
            </div>
        </div>
    )
}
export default PawnPromotion;