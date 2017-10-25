import React, {PureComponent} from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const styles = {
    dialog: {
        textAlign: 'center'
    }
};

class VideoPlayer extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._handleClose = this._handleClose.bind(this);
    }

    render() {
        const { data } = this.props;
        const { url, type, width, height } = data || {};

        const actions = [
            <FlatButton
                key="close"
                label="Close"
                primary={true}
                onClick={this._handleClose} />
        ];

        const player = type === 'text/html' && url ? (
            <iframe src={url} width={width} height={height} frameBorder="0" />
        ) : (null);

        return (
            <Dialog
                title="Video"
                actions={actions}
                contentStyle={styles.dialog}
                onRequestClose={this._handleClose}
                open={Boolean(player)}>
                {player}
            </Dialog>
        );
    }

    _handleClose() {
        this.props.onCloseVideo();
    }
}

export default VideoPlayer;
