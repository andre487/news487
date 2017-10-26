import React, {PureComponent} from 'react';
import AppBar from 'material-ui/AppBar';

const styles = {
    container: {
        height: '64px',
    },
    appBar: {
        top: 0,
        position: 'fixed',
    }
};

class Header extends PureComponent {
    render() {
        return (
            <div style={styles.container}>
                <AppBar
                    style={styles.appBar}
                    title={this.props.filterTitle || 'News'}
                    onLeftIconButtonTouchTap={this.props.onMenuButtonTap} />
            </div>
        );
    }
}

export default Header;
