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
    render() {
        const { src, alt, link, docType } = this.props;

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
}

export default DocumentPicture;
