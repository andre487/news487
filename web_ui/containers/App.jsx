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

        this.props.actions.fetchCategories();
    }

    render() {
        if (!this.props.app.routesSynced) {
            return (null);
        }

        const { actions, match } = this.props;
        const routeParams = match.params;

        const {
            menuOpened,
            categoriesRequestInProcess,
            routesMap,
            routePath,
            routeTitle
        } = this.props.app;

        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <Style rules={theme.globalStyle} />
                    <Header
                        onMenuButtonTap={actions.toggleMenu}
                        filterTitle={routeTitle} />
                    <AppMenu
                        onMenuClose={actions.toggleMenu}
                        onFilterSelected={actions.selectFilter}

                        opened={menuOpened}
                        routesMap={routesMap}
                        routePath={routePath}
                        categoriesRequestInProcess={categoriesRequestInProcess} />
                    <Shower
                        filterTitle={routeTitle}
                        routePath={routePath}
                        routeParams={routeParams} />
                </div>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return { app: state.app };
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
