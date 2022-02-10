import React from 'react';

class Header extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }
    render(){
        const root = {};
        return(
            <div style={root}>
                Header!
            </div>
        );
    }
}
export default Header;