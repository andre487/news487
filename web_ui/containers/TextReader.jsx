import React, {PureComponent} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import RaisedButton from 'material-ui/RaisedButton';

import * as TextReaderActions from '../actions/textReader';

import './TextReader.css';

const styles = {
    button: {
        margin: '20px 8px 10px',
    },
};

class TextReader extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this.onClick = this.onClick.bind(this);
    }

    render() {
        const stateData = this.props.textReader;

        let label = 'Start reading';
        if (stateData.readingInProcess) {
            label = stateData.readingStopInProcess ? 'Stopping' : 'Stop reading';
        }

        return (
            <RaisedButton
                onClick={this.onClick}
                label={label}
                primary={true}
                disabled={stateData.readingStopInProcess}
                style={styles.button} />
        );
    }

    onClick() {
        if (this.props.textReader.readingInProcess) {
            this.props.actions.stopReading();
        } else {
            this.props.actions.readAllNews();
        }
    }
}

function mapStateToProps(state) {
    return { textReader: state.textReader };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TextReaderActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TextReader);
