'use strict';
const config = require('./config');
const fetch = require('node-fetch');
const formatter = require('./formatter');
const { MongoClient } = require('mongodb');

const DEFAULT_DOCUMENTS_LIMIT = 5;

let _mongoDb;

const handlers = {
    hello,
    news,
    tech,
    finances,
    world,
    tags,
    text,
    digest,
};

function start(msg) {
    return hello(msg);
}

function hello(msg) {
    return msg.reply.text('✋');
}

function help(msg) {
    const commandsList = Object.keys(handlers).map(name => '/' + name).join('\n');

    return msg.reply.text(`👌 Available commands:\n${commandsList}`);
}

async function digest(msg) {
    return getDigestAndReply(msg, { limit: 2 });
}

async function news(msg) {
    return getDocumentsAndReply(msg);
}

async function tech(msg) {
    return getDocumentsAndReply(msg, { tags: 'tech' });
}

async function finances(msg) {
    return getDocumentsAndReply(msg, { tags: 'finances' });
}

async function world(msg) {
    return getDocumentsAndReply(msg, { tags: 'world' });
}

async function tags(msg) {
    const tagsMatch = msg.text.match(/\/tags\s*([\w\s]+)?/u);
    if (!tagsMatch) {
        return msg.reply.text('☝️ You should provide tags', { asReply: true });
    }

    const tagsString = tagsMatch[1].replace(/\s+/g, ',');
    return getDocumentsAndReply(msg, { tags: tagsString });
}

async function text(msg) {
    const text = msg.text.replace(/\/tags\s*([\w\s.-]+)?/u, '$1');
    if (!text) {
        return msg.reply.text('☝️ You should provide text', { asReply: true });
    }

    return getDocumentsAndReply(msg, { text });
}

async function getDocumentsAndReply(msg, params) {
    return makeRequest(msg, 'get-documents', params);
}

async function makeRequest(msg, handler, params) {
    const res = await fetch(await buildUrl(msg, handler, params));
    const responseText = await res.text();

    const data = JSON.parse(responseText);

    const docs = formatter.formatDocuments(data);
    for (let doc of docs) {
        await msg.reply.text(doc);
    }

    await saveLastDate(msg, data);
}

async function getDigestAndReply(msg, params) {
    return makeRequest(msg, 'get-digest', params);
}

async function saveLastDate(msg, data) {
    if (!config.storeData || msg.text.startsWith('/text')) {
        return;
    }

    let lastDate = '';
    for (let doc of data) {
        if (doc.published > lastDate) {
            lastDate = doc.published;
        }
    }

    if (!lastDate) {
        return;
    }

    const db = await getMongo();
    const collection = db.collection('last_published');

    await collection.createIndex({ key: 1 }, { unique: true });

    const key = getLastDateKey(msg);
    return collection.updateOne({ key }, { key, val: lastDate }, { upsert: true });
}

async function getLastDate(msg) {
    if (!config.storeData || msg.text.startsWith('/text')) {
        return '';
    }

    const db = await getMongo();
    const collection = db.collection('last_published');

    const key = getLastDateKey(msg);
    const data = await collection.findOne({ key });

    return data.val;
}

function getLastDateKey(msg) {
    const command = /(\/\w+)/.exec(msg.text)[1];
    return `${msg.from.id}:${msg.from.username}:${command}`;
}

async function getMongo() {
    if (!_mongoDb) {
        _mongoDb = await MongoClient.connect(`mongodb://${config.mongoHost}:${config.mongoPort}/${config.mongoDb}`);
    }
    return _mongoDb;
}

function wrapHandler(handler) {
    return async function wrapper(msg) {
        try {
            return await handler.call(this, msg);
        } catch (err) {
            console.error(err);
            return msg.reply.text(`😿 We have an error:\n${err}`);
        }
    }
}

async function buildUrl(msg, handler, params = {}) {
    const user = msg.from;

    Object.assign(params, {
        lang: user.language_code,
        from: 'telegram',
        'user-id': user.id,
        'user-login': user.username,
    });

    const limitMatch = msg.text.match(/\/[\w\s]+\s*(\d+)/u);
    if (limitMatch) {
        params.limit = limitMatch[1];
    } else if (!params.limit) {
        params.limit = DEFAULT_DOCUMENTS_LIMIT;
    }

    const unreadOnly = msg.text.includes('!ur');
    if (unreadOnly) {
        params['from-date'] = await getLastDate(msg);
    }

    const paramsString = Object.entries(params).map(([name, value]) => {
        return encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }).join('&');

    return `${config.apiUrl}/${handler}?${paramsString}`;
}

module.exports = Object.entries(
    Object.assign({ start, help }, handlers)
).reduce((res, [name, handler]) => {
    res[name] = wrapHandler(handler);
    return res;
}, {});
