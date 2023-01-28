// react
import React from 'react';
import './PawnPromotion.css';
//utils
import imageRouter, { WHITE, KING, PAWN } from '../../utils/constants';

type PawnPromotionProps = {
    color: string;
    promote: (promotion: string) => void;
};

const PawnPromotion = (props: PawnPromotionProps) => {

    const { color, promote, } = props;

    let images = Object.keys(imageRouter).filter(key => { // exclude choices for king and pawn
        return color === WHITE 
            ? key === key.toUpperCase() && key !== KING.toUpperCase() && key !== PAWN.toUpperCase()
            : key === key.toLowerCase() && key !== KING.toLowerCase() && key !== PAWN.toLowerCase()
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