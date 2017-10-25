import React, {PureComponent} from 'react';

import AppBar from 'material-ui/AppBar';
import CircularProgress from 'material-ui/CircularProgress';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import * as ViewTypes from '../constants/ViewTypes';

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

class AppMenu extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onSelectFilter = this._onSelectFilter.bind(this);
    }

    render() {
        const childNodes = this.props.categoriesRequestInProcess ? [
            this._createProgress()
        ] : [
            <AppBar
                key="header"
                title="Filters"
                iconElementLeft={<IconButton><NavigationClose /></IconButton>}
                onTitleTouchTap={this.props.onMenuClose}
                onLeftIconButtonTouchTap={this.props.onMenuClose} />
        ].concat(this._createFilterNodeList());

        return (
            <Drawer
                docked={false}
                open={this.props.opened}
                width={300}

                onRequestChange={this.props.onMenuClose}>
                {childNodes}
            </Drawer>
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
            viewType,
            routePath,
            routesMap,
            categoriesRequestInProcess,
            docsRequestInProcess
        } = this.props;

        const optionsAreDisabled = categoriesRequestInProcess || docsRequestInProcess;

        let defaultSelected = routePath;
        if (viewType === ViewTypes.TEXT_SEARCH) {
            defaultSelected = '/search';
        } else if (viewType === ViewTypes.TAG_SEARCH) {
            defaultSelected = '/tag';
        }

        const options = Object.entries(routesMap).map(([pathName, params], idx) => {
            const disabled = optionsAreDisabled || pathName === '/search' || pathName === '/tag';

            return (
                <RadioButton
                    key={`route:${idx}`}
                    disabled={disabled}
                    value={pathName}
                    label={params.label}
                    style={styles.option} />
            );
        });

        return [
            <RadioButtonGroup
                key="categories"
                name="categories"
                defaultSelected={defaultSelected}
                style={styles.radioGroup}
                onChange={this._onSelectFilter}>
                {options}
            </RadioButtonGroup>
        ];
    }

    _onSelectFilter(event, pathName) {
        this.props.onFilterSelected(pathName);
    }
}

export default AppMenu;
