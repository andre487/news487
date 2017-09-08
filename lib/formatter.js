'use strict';
const config = require('./config');
const moment = require('moment-timezone');

function formatDocuments(data) {
    data.sort((a, b) => {
        const ap = a.published;
        const bp = b.published;
        if (ap > bp) {
            return 1;
        }
        if (ap < bp) {
            return -1;
        }
        return 0;
    });

    return data.map(doc => {
        const tags = doc.tags.split(',')
            .map(tag => '#' + tag.replace(/\s+/g, '_'))
            .join(' ');

        const link = doc.link;
        const date = moment.tz(doc.published, 'UTC');
        const formattedDate = date.tz(config.tz).format('DD.MM.Y HH:mm');

        return `${link}\n${formattedDate}\n${tags}`;
    });
}

module.exports = {
    formatDocuments,
};
