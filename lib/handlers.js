'use strict';
const config = require('./config');
const fetch = require('node-fetch');
const formatter = require('./formatter');

const DEFAULT_DOCUMENTS_LIMIT = 5;

function hello(msg) {
    return msg.reply.text('✋');
}

function tech(msg) {
    return getDocumentsAnsReply(msg, { tags: 'tech' });
}

function world(msg) {
    return getDocumentsAnsReply(msg, { tags: 'world' });
}

function tags(msg) {
    const tagsList = msg.text.replace(/\/tags\s*([\w\s]+)?/u, '$1');
    if (!tagsList) {
        return msg.reply.text('☝️ You should provide tags', { asReply: true });
    }

    const tagsString = tagsList.replace(/\s+/g, ',');
    return getDocumentsAnsReply(msg, { tags: tagsString });
}

function text(msg) {
    const text = msg.text.replace(/\/tags\s*([\w\s.-]+)?/u, '$1');
    if (!text) {
        return msg.reply.text('☝️ You should provide text', { asReply: true });
    }

    return getDocumentsAnsReply(msg, { text });
}

async function getDocumentsAnsReply(msg, params) {
    const res = await fetch(buildUrl(msg, 'get-documents', params));
    const responseText = await res.text();

    return Promise.all(
        formatter.formatDocuments(responseText).map(doc => msg.reply.text(doc))
    );
}

function wrapHandler(handler) {
    return async function wrapper(msg) {
        try {
            return await handler.call(this, msg);
        } catch (err) {
            return msg.reply.text(`😿 We have an error:\n${err}`);
        }
    }
}

function buildUrl(msg, handler, params = {}) {
    const user = msg.from;

    Object.assign(params, {
        limit: DEFAULT_DOCUMENTS_LIMIT,
        lang: user.language_code,
        from: 'telegram',
        'user-id': user.id,
        'user-login': user.username,
    });

    const userLimit = msg.text.replace(/\/[\w\s]+\s*(\d+)?/u, '$1');
    if (userLimit) {
        params.limit = userLimit;
    }

    const paramsString = Object.entries(params).map(([name, value]) => {
        return encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }).join('&');

    return `${config.api_url}/${handler}?${paramsString}`;
}

module.exports = Object.entries({
    hello,
    tech,
    world,
    tags,
    text,
}).reduce((res, [name, handler]) => {
    res[name] = wrapHandler(handler);
    return res;
}, {});
