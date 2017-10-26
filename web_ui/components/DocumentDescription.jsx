import React, {PureComponent} from 'react';

import linkify from 'linkify-lite';

const styles = {
    description: {},
    twitterDescription: {
        whiteSpace: 'pre-wrap',
    }
};

class DocumentDescription extends PureComponent {
    render() {
        const { docType, isTwitter } = this.props;
        let { description } = this.props;

        const descriptionStyle = { ...styles.description };
        if (isTwitter) {
            Object.assign(descriptionStyle, styles.twitterDescription);

            description = linkify(description.replace(/(?:^\s*“)|(?:”\s*$)/g, ''));
        }

        if (docType === 'video') {
            description = `Video: ${description}`;
        }

        return (
            <div
                data-news-description="text"
                style={descriptionStyle}
                dangerouslySetInnerHTML={{ __html: description }} />
        );
    }
}

export default DocumentDescription;
