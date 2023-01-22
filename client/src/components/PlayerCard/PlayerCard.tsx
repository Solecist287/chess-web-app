// react
import React from 'react';
import './PlayerCard.css';

type PlayerCardProps = {
    name: string;
}

const PlayerCard = (props: PlayerCardProps) => {
    const { name, } = props;
    return(
        <div className='Player-card'>
            {`${name}`}
        </div>
    );
}
export default PlayerCard;