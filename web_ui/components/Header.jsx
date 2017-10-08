import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

const styles = {
    newsLabel: {
        margin: '0 5px 0 0'
    }
};

class Header extends Component {
    render() {
        return (
            <AppBar
                title={[
                    <span key="label" style={styles.newsLabel}>News:</span>,
                    <span key="filterTitle">{this.props.filterTitle}</span>
                ]}
                onLeftIconButtonTouchTap={this.props.onMenuButtonTap} />
        );
    }
}

export default Header;

