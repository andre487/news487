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

const filtersCache = {
    digest: 'Digest'
};

class AppMenu extends Component {
    constructor(props, state) {
        super(props, state);
    }

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
        ].concat(this._createCategoryNodesList());

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

    _createCategoryNodesList() {
        const {
            categories,
            selectedFilter,
            categoriesRequestInProcess
        } = this.props;

        return [
            <RadioButtonGroup
                key="categories"
                name="categories"
                defaultSelected={selectedFilter}
                onChange={this._onSelectFilter.bind(this)}>

                <RadioButton
                    key="digest"
                    disabled={categoriesRequestInProcess}
                    value="digest"
                    label="Digest"
                    style={styles.option} />

                {categories.map((category, idx) => {
                    const filterId = `category:${category.name}`;
                    const filterTitle = `Category "${category.name}"`;

                    filtersCache[filterId] = filterTitle;

                    return (
                        <RadioButton
                            key={idx}
                            disabled={categoriesRequestInProcess}
                            value={filterId}
                            label={filterTitle}
                            style={styles.option} />
                    );
                })}
            </RadioButtonGroup>
        ];
    }

    _onSelectFilter(event, selectedFilter) {
        const filterTitle = filtersCache[selectedFilter] || selectedFilter;
        this.props.onFilterSelected(selectedFilter, filterTitle);
    }
}

export default AppMenu;
