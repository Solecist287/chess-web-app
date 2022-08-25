import React from 'react';

class PlayerCard extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }
    render(){
        const root = {};
        const { name, } = this.props;
        return(
            <div style={root}>
                {`${name}`}
            </div>
        );
    }
}
export default PlayerCard;