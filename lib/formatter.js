'use strict';
const moment = require('moment');

function formatDocuments(data) {
    return data.map(doc => {
        const tags = doc.tags.split(',')
            .map(tag => '#' + tag.replace(/\s+/g, '_'))
            .join(' ');

        const date = moment(doc.published).format('DD.MM.Y HH:mm');

        return `${doc.link}\n${date}\n${tags}`;
    });
}

module.exports = {
    formatDocuments,
};
