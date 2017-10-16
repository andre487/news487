import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as AppActions from '../actions/app';

import Style from '../components/Style';
import Header from '../components/Header';
import AppMenu from '../components/AppMenu';
import Shower from './Shower';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from '../config/theme';

class App extends Component {
    componentWillMount() {
        const { actions, match } = this.props;

        const routePath = match.url;
        const routeParams = match.params;

        actions.syncRoutes(routePath, routeParams);
        actions.fetchCategories();
    }

    render() {
        if (!this.props.app.routesSynced) {
            return (null);
        }

        const { actions, match } = this.props;
        const routePath = match.url;
        const routeParams = match.params;

        const {
            menuOpened,
            categoriesRequestInProcess,
            routesMap,
            routeTitle,
            viewType,
            searchText
        } = this.props.app;

        const { docsRequestInProcess } = this.props.shower;

        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <Style rules={theme.globalStyle} />
                    <Header
                        onMenuButtonTap={actions.toggleMenu}
                        onTextSearch={this._onTextSearch.bind(this)}
                        viewType={viewType}
                        searchText={searchText}
                        filterTitle={routeTitle} />
                    <AppMenu
                        onMenuClose={actions.toggleMenu}
                        onFilterSelected={actions.selectFilter}

                        opened={menuOpened}
                        routesMap={routesMap}
                        routePath={routePath}
                        routeParams={routeParams}
                        categoriesRequestInProcess={categoriesRequestInProcess}
                        docsRequestInProcess={docsRequestInProcess} />
                    <Shower
                        onTagSelected={this._onTagSelected.bind(this)}
                        viewType={viewType}
                        searchText={searchText}
                        filterTitle={routeTitle}
                        routePath={routePath}
                        routeParams={routeParams} />
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
