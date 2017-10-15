import React, {Component} from 'react';

import AppBar from 'material-ui/AppBar';
import CircularProgress from 'material-ui/CircularProgress';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

const styles = {
    progress: {
        marginTop: 20,
        textAlign: 'center'
    },
    option: {
        margin: '30px 10px'
    }
};

class AppMenu extends Component {
    render() {
        if (!this.props.opened) {
            return (null);
        }

        const childNodes = [
            <AppBar
                key="header"
                title="Filters"
                iconElementLeft={<IconButton><NavigationClose /></IconButton>}
                onTitleTouchTap={this.props.onMenuClose}
                onLeftIconButtonTouchTap={this.props.onMenuClose} />
        ].concat(this._createFilterNodeList());

        if (this.props.categoriesRequestInProcess) {
            childNodes.push(this._createProgress());
        }

        return (
            <Drawer children={childNodes} />
        );
    }

    _createProgress() {
        return (
            <div key="0" style={styles.progress}>
                <CircularProgress size={60} thickness={5} />
            </div>
        );
    }

    _createFilterNodeList() {
        const {
            routesMap,
            routePath,
            categoriesRequestInProcess,
            docsRequestInProcess
        } = this.props;

        const optionsAreDisabled = categoriesRequestInProcess || docsRequestInProcess;

        return [
            <RadioButtonGroup
                key="categories"
                name="categories"
                defaultSelected={routePath}
                onChange={this._onSelectFilter.bind(this)}>

                {Object.entries(routesMap).map(([pathName, params], idx) => {
                    return (
                        <RadioButton
                            key={idx}
                            disabled={optionsAreDisabled}
                            value={pathName}
                            label={params.title}
                            style={styles.option} />
                    );
                })}
            </RadioButtonGroup>
        ];
    }

    _onSelectFilter(event, pathName) {
        this.props.onFilterSelected(pathName);
    }
}

export default AppMenu;
