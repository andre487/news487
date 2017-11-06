import React, {PureComponent} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as AppActions from '../actions/app';

import Header from '../components/Header';
import AppMenu from '../components/AppMenu';
import Toolbar from '../components/Toolbar';
import Shower from './Shower';
import ErrorReporter from './ErrorReporter';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from '../config/theme';

class App extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onTextSearch = this._onTextSearch.bind(this);
        this._onTagSelected = this._onTagSelected.bind(this);

        this._onPrevPage = this._onPrevPage.bind(this);
        this._onNextPage = this._onNextPage.bind(this);
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
            page,
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
                        onPrevPage={this._onPrevPage}
                        onNextPage={this._onNextPage}
                        viewType={viewType}
                        searchText={searchText}
                        page={page}
                        filterTitle={routeTitle} />
                    <ErrorReporter />
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

    _onPrevPage() {
        this.props.actions.goToPrevPage();
    }

    _onNextPage() {
        this.props.actions.goToNextPage();
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
