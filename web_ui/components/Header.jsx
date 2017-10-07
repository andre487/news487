import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

class Header extends Component {
    render() {
        return (
            <AppBar
                title='News from all the Internet'
                onLeftIconButtonTouchTap={this.props.onMenuButtonTap} />
        );
    }
}

export default Header;

