import React, {PureComponent} from 'react';

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

            description = description.replace(/(?:^\s*“)|(?:”\s*$)/g, '');
        }

        if (docType === 'video') {
            description = `Video: ${description}`;
        }

        return (
            <div
                style={descriptionStyle}
                dangerouslySetInnerHTML={{ __html: description }} />
        );
    }
}

export default DocumentDescription;
