import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ErrorReporterActions from '../actions/errorReporter';

import Snackbar from 'material-ui/Snackbar';

class ErrorReporter extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onErrorEvent = this._onErrorEvent.bind(this);
        this._handleSnackbarClose = this._handleSnackbarClose.bind(this);
    }

    componentDidMount() {
        window.addEventListener('error', this._onErrorEvent);
    }

    componentWillUnmount() {
        window.removeEventListener('error', this._onErrorEvent);
    }

    render() {
        const { currentErrors } = this.props.errorReporter;

        const report = Object.entries(currentErrors)
            .reduce((res, [message, count]) => {
                return `${res}\n${message}${count ? ` × ${count}` : ''}`;
            }, '')
            .trim();

        return (
            <Snackbar
                open={Boolean(report)}
                message={report}
                autoHideDuration={4000}
                onRequestClose={this._handleSnackbarClose} />
        );
    }

    _onErrorEvent(event) {
        this.props.actions.dispatchError(event.message);
    }

    _handleSnackbarClose() {
        this.props.actions.eraseErrors();
    }
}

function mapStateToProps(state) {
    return { errorReporter: state.errorReporter };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(ErrorReporterActions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorReporter);
