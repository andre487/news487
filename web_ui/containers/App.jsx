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
    componentDidMount() {
        this.props.actions.fetchCategories();
    }

    render() {
        const { actions } = this.props;
        const {
            menuOpened,
            categories,
            selectedFilter,
            filterTitle,
            categoriesRequestInProcess
        } = this.props.app;

        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <Style rules={theme.globalStyle} />
                    <Header
                        onMenuButtonTap={actions.toggleMenu}
                        filterTitle={filterTitle} />
                    <AppMenu
                        onMenuClose={actions.toggleMenu}
                        onFilterSelected={actions.selectFilter}
                        opened={menuOpened}
                        categories={categories}
                        selectedFilter={selectedFilter}
                        categoriesRequestInProcess={categoriesRequestInProcess} />
                    <Shower selectedFilter={selectedFilter} />
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
