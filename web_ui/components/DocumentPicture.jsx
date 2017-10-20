import React, {PureComponent} from 'react';

import theme from '../config/theme';

const styles = {
    container: {
        float: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        width: '20%',
        minWidth: 150,
        minHeight: 150,
        marginTop: '5px',
        marginRight: '15px',
        padding: '5px',
        textAlign: 'center',
        verticalAlign: 'center',
        background: theme.palette.primary3Color
    },
    picture: {

    }
};

class DocumentPicture extends PureComponent {
    render() {
        const { src, alt } = this.props;

        if (!src) {
            return (null);
        }

        return (
            <div style={styles.container}>
                <img src={src} alt={alt} style={styles.picture} />
            </div>
        );
    }
}

export default DocumentPicture;
