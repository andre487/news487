'use strict';
const stripTags = require('striptags');

function formatDocuments(responseText) {
    const data = JSON.parse(responseText);

    return data.slice(0, 5).map(doc => `${doc.title}

${doc.link || ''}

${stripTags(doc.description).trim().slice(0, 140) + '…'}`);
}

module.exports = {
    formatDocuments
};
