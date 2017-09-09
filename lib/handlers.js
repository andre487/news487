'use strict';
const config = require('./config');
const fetch = require('node-fetch');
const formatter = require('./formatter');
const { MongoClient } = require('mongodb');

const DEFAULT_DOCUMENTS_LIMIT = 5;

let _mongoDb;

const handlers = {
    cat,
    digest,
    query,

    start,
    keys,
    nokeys,
    hello,
    help,
};

async function start(msg) {
    return keys.call(this, msg);
}

async function help(msg) {
    return this.sendMessage(msg.from.id, '.!.');
}

async function hello(msg) {
    return this.sendMessage(msg.from.id, '✋');
}

async function keys(msg) {
    const buttonsData = await getButtons();
    const labels = Object.entries(buttonsData).map(([, v]) => v.label);

    const buttons = [[], [], []];
    for (let i = 0; i < labels.length; i++) {
        const slot = i % 3;
        buttons[slot].push(labels[i]);
    }

    const replyMarkup = this.keyboard(buttons, { resize: true });

    return this.sendMessage(msg.from.id, 'See keyboard below', { replyMarkup });
}

async function nokeys(msg) {
    return this.sendMessage(msg.from.id, 'Type /keys to show keyboard again', { replyMarkup: 'hide' });
}

async function cat(msg) {
    const matches = /\/cat\s+(.+)/.exec(msg.text);
    if (!matches) {
        return this.sendMessage(msg.from.id, '☝️ You should provide category');
    }

    return makeRequest.call(this, msg, 'get-documents-by-category', { name: matches[1] });
}

async function digest(msg) {
    return getDigestAndReply.call(this, msg, { limit: 2 });
}

async function query(msg) {
    const tagsMatch = /\/query\s*([\w\s]+)?/u.exec(msg.text);
    if (!tagsMatch) {
        return this.sendMessage(msg.from.id, '☝️ You should provide query');
    }
    const tagsString = tagsMatch[1].replace(/\s+/g, ',');
    return getDocumentsAndReply.call(this, msg, { tags: tagsString });
}

async function getDocumentsAndReply(msg, params) {
    return makeRequest.call(this, msg, 'get-documents', params);
}

async function makeRequest(msg, handler, params) {
    const res = await fetch(await buildUrl(msg, handler, params));
    const responseText = await res.text();

    const data = JSON.parse(responseText);

    const docs = await formatter.formatDocuments(data);
    for (let doc of docs) {
        await this.sendMessage(msg.from.id, doc);
    }

    await saveLastDate(msg, data);
}

async function getDigestAndReply(msg, params) {
    return makeRequest.call(this, msg, 'get-digest', params);
}

async function getButtons() {
    const categories = await getCategories();

    return categories.reduce((res, name) => {
        const command = `/cat ${name}`;
        res[command] = { label: command, command };
        return res;
    }, {});
}

async function getCategories() {
    const res = await fetch(`${config.apiUrl}/get-categories`);
    const responseText = await res.text();

    const data = JSON.parse(responseText);

    return data.map(doc => doc.name);
}

async function saveLastDate(msg, data) {
    const msgText = msg.text || '';
    if (!config.storeData || msgText.startsWith('/text')) {
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

    await collection.createIndex({ key: 1 }, { unique: true, expireAfterSeconds: 10080 });

    const key = getLastDateKey(msg);
    if (key) {
        return collection.updateOne({ key }, { key, val: lastDate }, { upsert: true });
    }
}

async function getLastDate(msg) {
    const msgText = msg.text || '';
    if (!config.storeData || msgText.startsWith('/text')) {
        return '';
    }

    const db = await getMongo();
    const collection = db.collection('last_published');

    const key = getLastDateKey(msg);
    if (key) {
        const data = await collection.findOne({ key });

        return data ? data.val : '';
    }

    return '';
}

function getLastDateKey(msg) {
    const matches = /^\/?(\w+)/.exec(msg.text);
    const command = matches && matches[1];
    if (!command) {
        return null;
    }
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

    // Add date in case of special flag or keyboard usage
    if (msgText && (msgText.includes('!ur') || !msgText.startsWith('/'))) {
        const lastDate = await getLastDate(msg);
        if (lastDate) {
            params['from-date'] = lastDate;
        }
    }

    const paramsString = Object.entries(params).map(([name, value]) => {
        return encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }).join('&');

    return `${config.apiUrl}/${handler}?${paramsString}`;
}

const listeners = Object.entries(handlers).reduce((res, [name, handler]) => {
    res[name] = wrapHandler(handler);
    return res;
}, {});

module.exports = {
    listeners,
    getButtons,
};
