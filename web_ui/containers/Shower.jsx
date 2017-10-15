import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as ShowerActions from '../actions/shower';
import DocumentsList from '../components/DocumentsList';

class Shower extends Component {
    componentDidMount() {
        this._fetchDocuments(this.props.routePath, this.props.routeParams);
    }

    componentWillUpdate(newProps) {
        if (newProps.routePath !== this._routePath) {
            this._fetchDocuments(newProps.routePath, newProps.routeParams);
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

    _fetchDocuments(routePath, routeParams) {
        this._routePath = routePath;

        this.props.actions.fetchDocs(this._routePath, routeParams);
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
