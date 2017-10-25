import React, {PureComponent} from 'react';

import DocumentDescription from './DocumentDescription';
import DocumentPicture from './DocumentPicture';

import './Document.css';

const styles = {
    container: {
        overflow: 'hidden'
    }
};

class Document extends PureComponent {
    render() {
        const {
            cardType,
            isTwitter,
            title,
            link,
            picture,
        } = this.props;

        let { description } = this.props;

        let docType = cardType || '';
        if (isTwitter && docType === 'article' && picture) {
            docType = 'summary-large-image';
        }
        docType = docType.replace(/_/g, '-');

        return (
            <div style={styles.container} className={`document-card ${docType}`}>
                <DocumentPicture src={picture} alt={title} link={link} docType={docType} />
                <DocumentDescription description={description} docType={docType} isTwitter={isTwitter} />
            </div>
        );
    }
}

export default Document;
