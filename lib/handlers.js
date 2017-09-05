'use strict';
const config = require('./config');
const fetch = require('node-fetch');
const formatter = require('./formatter');

function hello(msg) {
    return msg.reply.text('✋');
}

function tech(msg) {
    return fetch(`${config.api_url}/get-documents?tags=tech`)
        .then(res => res.text())
        .then(responseText => {
            return Promise.all(
                formatter.formatDocuments(responseText)
                    .map(doc => msg.reply.text(doc))
            )
        })
        .then(console.log);
}

module.exports = {
    hello,
    tech,
};
