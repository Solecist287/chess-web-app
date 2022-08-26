import React from 'react';

const PlayerCard = (props) => {
    const root = {};
    const { name, } = props;
    return(
        <div style={root}>
            {`${name}`}
        </div>
    );
}
export default PlayerCard;