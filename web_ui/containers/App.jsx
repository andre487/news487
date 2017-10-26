import React, {PureComponent} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as AppActions from '../actions/app';

import Header from '../components/Header';
import AppMenu from '../components/AppMenu';
import Toolbar from '../components/Toolbar';
import Shower from './Shower';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from '../config/theme';

class App extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onTextSearch = this._onTextSearch.bind(this);
        this._onTagSelected = this._onTagSelected.bind(this);
    }

    componentWillMount() {
        this.props.actions.fetchCategories();
    }

    render() {
        const { actions, match } = this.props;
        const { docsRequestInProcess } = this.props.shower;

        const {
            menuOpened,
            categoriesRequestInProcess,
            routesMap,
            routeTitle,
            viewType,
            searchText,
        } = this.props.app;

        const routePath = match.url;

        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <Header
                        onMenuButtonTap={actions.toggleMenu}
                        filterTitle={routeTitle} />
                    <AppMenu
                        onMenuClose={actions.toggleMenu}
                        onFilterSelected={actions.selectFilter}

                        opened={menuOpened}
                        routesMap={routesMap}
                        viewType={viewType}
                        routePath={routePath}
                        categoriesRequestInProcess={categoriesRequestInProcess}
                        docsRequestInProcess={docsRequestInProcess} />
                    <Toolbar
                        onTextSearch={this._onTextSearch}
                        viewType={viewType}
                        searchText={searchText} />
                    <Shower
                        onTagSelected={this._onTagSelected}
                        viewType={viewType}
                        searchText={searchText}
                        filterTitle={routeTitle} />
                </div>
            </MuiThemeProvider>
        );
    }

    _onTextSearch(text) {
        this.props.actions.searchByText(text);
    }

    _onTagSelected(tag) {
        this.props.actions.searchByTag(tag);
    }
}

function mapStateToProps(state) {
    return {
        app: state.app,
        shower: state.shower
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(AppActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
