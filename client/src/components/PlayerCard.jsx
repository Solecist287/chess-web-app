import React from 'react';

const PlayerCard = (props) => {
    const root = {
        margin: '0 auto',
    };
    const { name, } = props;
    return(
        <div style={root}>
            {`${name}`}
        </div>
    );
}
export default PlayerCard;