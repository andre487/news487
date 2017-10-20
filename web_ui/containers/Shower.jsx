import React, {PureComponent} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import * as ShowerActions from '../actions/shower';
import * as ViewTypes from '../constants/ViewTypes';
import DocumentsList from '../components/DocumentList';

class Shower extends PureComponent {
    componentDidMount() {
        const { viewType, routePath, routeParams } = this.props;

        this._fetchDocuments(viewType, routePath, routeParams);
    }

    componentWillUpdate(newProps) {
        const { viewType, routePath, routeParams } = newProps;

        if (this._shouldFetchDocuments(viewType, routePath, routeParams)) {
            this._fetchDocuments(viewType, routePath, routeParams);
        }
    }

    render() {
        const {
            docsRequestInProcess,
            docs,
            error,
            expandedState
        } = this.props.shower;

        if (error) {
            return this._showErrorWindow(error);
        }

        return (
            <DocumentsList
                onCardExpandChange={this._onCardExpandChange.bind(this)}
                onTagSelected={this.props.onTagSelected}

                requestInProgress={docsRequestInProcess}
                expandedState={expandedState}
                items={docs} />
        );
    }

    _shouldFetchDocuments(viewType, routePath, routeParams) {
        if (viewType !== this._viewType) {
            return true;
        }

        switch (viewType) {
            case ViewTypes.TEXT_SEARCH:
                return this._routeParams.text !== routeParams.text;
            case ViewTypes.TAG_SEARCH:
                return this._routeParams.tag !== routeParams.tag;
            default:
                return routePath !== this._routePath;
        }
    }

    _fetchDocuments(viewType, routePath, routeParams) {
        this._viewType = viewType;
        this._routePath = routePath;
        this._routeParams = routeParams;

        this.props.actions.fetchDocs(viewType, routePath, routeParams);
    }

    _showErrorWindow(error) {
        const actions = [
            <FlatButton
                key="ok"
                label="OK 😿"
                primary={true}
                onClick={this._handleCloseError.bind(this)} />
        ];

        return (
            <Dialog
                title="Something went wrong 😿"
                actions={actions}
                modal={false}
                open={true}
                onRequestClose={this._handleCloseError.bind(this)}>

                <pre>{error}</pre>
            </Dialog>
        );
    }

    _handleCloseError() {
        this.props.actions.eraseError();
    }

    _onCardExpandChange(docId, state) {
        this.props.actions.changeCardExpand(docId, state);
    }
}

function mapStateToProps(state) {
    return { shower: state.shower };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ShowerActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Shower);
