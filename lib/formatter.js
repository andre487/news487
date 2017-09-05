'use strict';
function formatDocuments(responseText) {
    const data = JSON.parse(responseText);

    return data.map(doc => {
        const tagsString = doc.tags
            .split(',')
            .map(tag => '#' + tag.replace(/\s+/g, '_'))
            .join(' ');

        return `${doc.link}\n${tagsString}`;
    });
}

module.exports = {
    formatDocuments
};
