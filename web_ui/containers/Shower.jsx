import React, {PureComponent} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import * as ShowerActions from '../actions/shower';
import DocumentsList from '../components/DocumentList';

class Shower extends PureComponent {
    componentDidMount() {
        const { viewType, searchText } = this.props;

        this._fetchDocuments(viewType, searchText);
    }

    componentWillUpdate(newProps) {
        const { viewType, searchText } = newProps;

        if (viewType !== this._viewType || searchText !== this._searchText) {
            this._fetchDocuments(viewType, searchText);
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

    _fetchDocuments(viewType, searchText) {
        this._viewType = viewType;
        this._searchText = searchText;

        this.props.actions.fetchDocs(viewType, searchText);
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
