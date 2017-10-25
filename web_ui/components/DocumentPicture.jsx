import React, {PureComponent} from 'react';

import theme from '../config/theme';
import playButton from '../images/play.svg';

const styles = {
    container: {
        float: 'left',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        width: '20%',
        minWidth: '150px',
        minHeight: '150px',
        maxHeight: '480px',
        marginTop: '5px',
        marginRight: '15px',
        padding: '5px',
        textAlign: 'center',
        background: theme.palette.primary3Color,
        border: 'none',
    },
    containerLargeImage: {
        float: 'none',
        width: '100%',
        marginTop: 0,
        marginRight: 0,
        marginBottom: '15px',
    },
    picture: {
        maxWidth: '100%',
        maxHeight: '470px',
    },
    videoButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        margin: 'auto',
        maxWidth: '100px',
        maxHeight: '100px',
        opacity: 0.6,
    }
};

class DocumentPicture extends PureComponent {
    constructor(props, state) {
        super(props, state);

        this._onPictureClick = this._onPictureClick.bind(this);
    }

    render() {
        const { src, alt, link, video, docType } = this.props;

        this._videoData = video;

        if (!src) {
            return (null);
        }

        const isVideo = docType === 'video';
        const containerStyle = { ...styles.container };

        if (docType === 'summary-large-image' || isVideo) {
            Object.assign(containerStyle, styles.containerLargeImage);
        }

        return (
            <a style={containerStyle}
               onClick={this._onPictureClick}
               href={link}
               target="_blank"
               rel="noopener">
                <img src={src} alt={alt} style={styles.picture} />
                {isVideo ?
                    <span
                        style={styles.videoButton}
                        dangerouslySetInnerHTML={{ __html: playButton }} /> :
                    (null)}
            </a>
        );
    }

    _onPictureClick(e) {
        if (this._videoData && this._videoData.url && this._videoData.type === 'text/html') {
            this.props.onOpenVideo(this._videoData);
            e.preventDefault();
        }
    }
}

export default DocumentPicture;
