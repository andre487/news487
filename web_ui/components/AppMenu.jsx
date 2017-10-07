import React, {Component} from 'react';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

class AppMenu extends Component {
    render() {
        const menu = this.props.opened ?
            <Drawer
                children={[
                    <AppBar
                        key="0"
                        title="Filters"
                        iconElementLeft={<IconButton><NavigationClose /></IconButton>}
                        onTitleTouchTap={this.props.onMenuClose}
                        onLeftIconButtonTouchTap={this.props.onMenuClose} />
                ]} /> :
            '';

        return (
            <div>{menu}</div>
        );
    }
}

export default AppMenu;
