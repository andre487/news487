import React, {PureComponent} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import * as ShowerActions from '../actions/shower';
import VideoPlayer from '../components/VideoPlayer';
import DocumentsList from '../components/DocumentList';

class Shower extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onCardExpandChange = this._onCardExpandChange.bind(this);
        this._handleCloseError = this._handleCloseError.bind(this);

        this._onOpenVideo = this._onOpenVideo.bind(this);
        this._onCloseVideo = this._onCloseVideo.bind(this);
    }

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
            expandedState,
            showVideoData,
        } = this.props.shower;

        if (error) {
            return this._showErrorWindow(error);
        }

        const elems = [
            <DocumentsList
                key="documents-list"

                onCardExpandChange={this._onCardExpandChange}
                onOpenVideo={this._onOpenVideo}
                onTagSelected={this.props.onTagSelected}

                requestInProgress={docsRequestInProcess}
                expandedState={expandedState}
                items={docs} />,
            <VideoPlayer
                key="video-player"
                onCloseVideo={this._onCloseVideo}
                data={showVideoData} />
        ];

        return <div>{elems}</div>;
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
                onClick={this._handleCloseError} />
        ];

        return (
            <Dialog
                title="Something went wrong 😿"
                actions={actions}
                modal={false}
                open={true}
                onRequestClose={this._handleCloseError}>

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

    _onOpenVideo(videoData) {
        this.props.actions.showVideo(videoData);
    }

    _onCloseVideo() {
        this.props.actions.hideVideo();
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
