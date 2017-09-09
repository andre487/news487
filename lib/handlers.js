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

const availableEvents = Object.keys(handlers);

function start(msg) {
    return help.call(this, msg);
}

function hello(msg) {
    return this.sendMessage(msg.from.id, '✋');
}

function help(msg) {
    const buttons = [[], [], []];
    for (let i = 0; i < availableEvents.length; i++) {
        const event = availableEvents[i];
        const slot = i % 3;
        buttons[slot].push(this.inlineButton(event, { callback: '/' + event }));
    }

    const replyMarkup = this.inlineKeyboard(buttons);
    return this.sendMessage(msg.from.id, 'Available commands', { replyMarkup });
}

async function digest(msg) {
    return getDigestAndReply.call(this, msg, { limit: 2 });
}

async function news(msg) {
    return getDocumentsAndReply.call(this, msg);
}

async function tech(msg) {
    return getDocumentsAndReply.call(this, msg, { tags: 'tech' });
}

async function finances(msg) {
    return getDocumentsAndReply.call(this, msg, { tags: 'finances' });
}

async function world(msg) {
    return getDocumentsAndReply.call(this, msg, { tags: 'world' });
}

async function tags(msg) {
    const msgText = msg.text || '';
    const tagsMatch = msgText.match(/\/tags\s*([\w\s]+)?/u);
    if (!tagsMatch) {
        return this.sendMessage(msg.from.id, '☝️ You should provide tags');
    }
    const tagsString = tagsMatch[1].replace(/\s+/g, ',');
    return getDocumentsAndReply.call(this, msg, { tags: tagsString });
}

async function text(msg) {
    const msgText = msg.text || '';
    const text = msgText.replace(/\/text\s*([\w\s.-]+)?/u, '$1');
    if (!text) {
        return this.sendMessage(msg.from.id, '☝️ You should provide text');
    }
    return getDocumentsAndReply.call(this, msg, { text });
}

async function getDocumentsAndReply(msg, params) {
    return makeRequest.call(this, msg, 'get-documents', params);
}

async function makeRequest(msg, handler, params) {
    const res = await fetch(await buildUrl(msg, handler, params));
    const responseText = await res.text();

    const data = JSON.parse(responseText);

    const docs = formatter.formatDocuments(data);
    for (let doc of docs) {
        await this.sendMessage(msg.from.id, doc);
    }

    await saveLastDate(msg, data);
}

async function getDigestAndReply(msg, params) {
    return makeRequest.call(this, msg, 'get-digest', params);
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
            return this.sendMessage(msg.from.id, `😿 We have an error:\n${err}`);
        }
    }
}

async function buildUrl(msg, handler, params = {}) {
    const user = msg.from;
    const msgText = msg.text || '';

    Object.assign(params, {
        lang: user.language_code,
        from: 'telegram',
        'user-id': user.id,
        'user-login': user.username,
    });

    const limitMatch = msgText.match(/\/[\w\s]+\s*(\d+)/u);
    if (limitMatch) {
        params.limit = limitMatch[1];
    } else if (!params.limit) {
        params.limit = DEFAULT_DOCUMENTS_LIMIT;
    }

    const unreadOnly = msgText.includes('!ur');
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
