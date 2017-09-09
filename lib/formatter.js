'use strict';
const config = require('./config');
const gooGl = require('goo.gl');
const moment = require('moment-timezone');

gooGl.setKey(config.gooGlKey);

async function formatDocuments(data) {
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

    const docs = [];
    for (let doc of data) {
        const link = await gooGl.shorten(doc.link);
        const date = moment.tz(doc.published, 'UTC');
        const formattedDate = date.tz(config.tz).format('DD.MM.Y HH:mm');

        docs.push(`${formattedDate} ${link}`);
    }

    return docs;
}

module.exports = {
    formatDocuments,
};
