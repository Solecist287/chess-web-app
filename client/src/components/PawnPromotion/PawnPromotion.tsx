// react
import React from 'react';
import './PawnPromotion.css';
//utils
import imageRouter, { WHITE } from '../../utils/constants';

type PawnPromotionProps = {
    color: string;
    promote: (promotion: string) => void;
};

const PawnPromotion = (props: PawnPromotionProps) => {

    const { color, promote, } = props;

    let images = Object.keys(imageRouter).filter(key => {
        return color === WHITE 
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