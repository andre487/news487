import React, {PureComponent} from 'react';

import DocumentPicture from './DocumentPicture';

import './Document.css';

const styles = {
    container: {
        overflow: 'hidden'
    }
};

class Document extends PureComponent {
    render() {
        const { title, picture, origPicture, description } = this.props;

        const pictureSrc = origPicture || picture;

        return (
            <div style={styles.container} className="document-card">
                <DocumentPicture src={pictureSrc} alt={title} />
                <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
        );
    }
}

export default Document;
