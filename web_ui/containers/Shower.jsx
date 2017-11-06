import React, {PureComponent} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import * as ShowerActions from '../actions/shower';
import VideoPlayer from '../components/VideoPlayer';
import DocumentsList from '../components/DocumentList';
import Pagination from '../components/Pagination';

class Shower extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onCardExpandChange = this._onCardExpandChange.bind(this);
        this._handleCloseError = this._handleCloseError.bind(this);

        this._onPrevPage = this._onPrevPage.bind(this);
        this._onNextPage = this._onNextPage.bind(this);

        this._onOpenVideo = this._onOpenVideo.bind(this);
        this._onCloseVideo = this._onCloseVideo.bind(this);
    }

    componentDidMount() {
        const { viewType, searchText } = this.props;
        const { page } = this.props.shower;

        this._fetchDocuments(viewType, searchText, page);
    }

    componentWillUpdate(newProps) {
        const { viewType, searchText } = newProps;
        const { page } = newProps.shower;

        if (viewType !== this._viewType || searchText !== this._searchText || page !== this._page) {
            this._fetchDocuments(viewType, searchText, page);
        }
    }

    render() {
        const {
            docsRequestInProcess,
            docs,
            page,
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
            docs && docs.length ? <Pagination
                key="pagination-buttons"
                page={page}
                disabled={docsRequestInProcess}
                onPreviousClick={this._onPrevPage}
                onNextClick={this._onNextPage} /> : (null),
            <VideoPlayer
                key="video-player"
                onCloseVideo={this._onCloseVideo}
                data={showVideoData} />
        ];

        return <div>{elems}</div>;
    }

    _fetchDocuments(viewType, searchText, page) {
        this._viewType = viewType;
        this._searchText = searchText;
        this._page = page;

        this.props.actions.fetchDocs(viewType, searchText, page);
    }

    _onPrevPage() {
        this.props.actions.goToPrevPage();
    }

    _onNextPage() {
        this.props.actions.goToNextPage();
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
