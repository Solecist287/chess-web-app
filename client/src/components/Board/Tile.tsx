import React from 'react';
import { StringLiteral } from 'typescript';
import imageRouter from '../../utilities/imageRouter';

import './Tile.css';

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
            <div className='Content'>
                <div className='Table'>
                    <div className='Table-cell'>
                        <img className='Image' src={imageRouter[symbol]}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Tile;