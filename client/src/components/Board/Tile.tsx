// react
import React from 'react';
import './Tile.css';
//utils
import imageRouter from '../../utils/constants';

type TileProps = {
    backgroundColorMode: string;
    outlineMode: string;
    symbol: string;
    onClick: React.MouseEventHandler;
};

const Tile = (props: TileProps) => {
    const {
        backgroundColorMode, 
        outlineMode,
        symbol,
        onClick,
    } = props;

    return (
        <div 
            className={['Square', backgroundColorMode, outlineMode].join(' ')}
            onClick={onClick}
        >
            <img className='Image' src={imageRouter[symbol]}/>
        </div>
    );
}
export default Tile;