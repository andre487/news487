import React, {Component} from 'react';

import AppBar from 'material-ui/AppBar';
import CircularProgress from 'material-ui/CircularProgress';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import * as util from '../util';

const styles = {
    progress: {
        marginTop: 20,
        textAlign: 'center'
    },
    radioGroup: {
        marginTop: '15px'
    },
    option: {
        padding: '10px',
        boxSizing: 'border-box'
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
            <Drawer
                docked={false}
                open={true}
                width={300}

                onRequestChange={this.props.onMenuClose}
                children={childNodes} />
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
            routeParams,
            categoriesRequestInProcess,
            docsRequestInProcess
        } = this.props;

        const optionsAreDisabled = categoriesRequestInProcess || docsRequestInProcess;

        let defaultSelected = routePath;
        if (util.isTextSearchRoute(routePath, routeParams)) {
            defaultSelected = '/search';
        } else if (util.isTagSearchRoute(routePath, routeParams)) {
            defaultSelected = '/tag';
        }

        const options = Object.entries(routesMap).map(([pathName, params], idx) => {
            const disabled = optionsAreDisabled || pathName === '/search' || pathName === '/tag';

            return (
                <RadioButton
                    key={`route:${idx}`}
                    disabled={disabled}
                    value={pathName}
                    label={params.title}
                    style={styles.option} />
            );
        });

        return [
            <RadioButtonGroup
                key="categories"
                name="categories"
                defaultSelected={defaultSelected}
                style={styles.radioGroup}
                onChange={this._onSelectFilter.bind(this)}

                children={options} />
        ];
    }

    _onSelectFilter(event, pathName) {
        this.props.onFilterSelected(pathName);
    }
}

export default AppMenu;
