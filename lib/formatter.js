'use strict';
const moment = require('moment');

function formatDocuments(data) {
    data.sort((a, b) => {
        if (a.published > b.published) {
            return 1;
        } else if (a.published < b.published) {
            return -1;
        }
        return 0;
    });

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
