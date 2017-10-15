import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as ShowerActions from '../actions/shower';
import * as ViewTypes from '../constants/ViewTypes';
import DocumentsList from '../components/DocumentsList';

class Shower extends Component {
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
            docs
        } = this.props.shower;

        return (
            <DocumentsList
                requestInProgress={docsRequestInProcess}
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
