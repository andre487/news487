'use strict';
const config = require('./config');
const fetch = require('node-fetch');
const formatter = require('./formatter');
const { MongoClient } = require('mongodb');

const DEFAULT_DOCUMENTS_LIMIT = 15;

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
    reset,
    newest,
};

cat.doc = 'show docs from category: /cat name';
digest.doc = 'show digest from all categories';
query.doc = 'search docs via query: /query tag1,tag2,tag3…';

start.doc = 'start chat';
keys.doc = 'show or update keyboard';
nokeys.doc = 'hide keyboard';
hello.doc = 'just a polite method';
help.doc = 'show available methods';
reset.doc = 'Reset last date for posts';
newest.doc = 'Change updates settings: /newest – receive only newest, /newest 0 – receive all';

async function start(msg) {
    return keys.call(this, msg);
}

async function help(msg) {
    const helpMessage = Object.entries(handlers).reduce((res, [name, listener]) => {
        res.push(`/${name} – ${listener.doc}`);
        return res;
    }, []).join('\n');

    return this.sendMessage(msg.from.id, helpMessage);
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
    const matches = /\/cat\s+(.+)(?:\s+!all)?/.exec(msg.text);
    if (!matches) {
        return this.sendMessage(msg.from.id, '☝️ You should provide category');
    }

    return makeRequest.call(this, msg, 'get-documents-by-category', { name: matches[1] });
}

async function digest(msg) {
    return getDigestAndReply.call(this, msg);
}

async function query(msg) {
    const tagsMatch = /\/query\s*([\w\s]+)?/u.exec(msg.text);
    if (!tagsMatch) {
        return this.sendMessage(msg.from.id, '☝️ You should provide query');
    }
    const tagsString = tagsMatch[1].replace(/\s+/g, ',');
    return getDocumentsAndReply.call(this, msg, { tags: tagsString });
}

async function reset(msg) {
    const db = await getMongo();
    const collection = db.collection('last_published');

    const keyPattern = getLastDateKeyPattern(msg);
    await collection.removeMany({ 'key': { '$regex': keyPattern } });

    return this.sendMessage(msg.from.id, '👍 Done!');
}

async function newest(msg) {
    const db = await getMongo();
    const userId = msg.from.id;

    const disable = /\/newest\s+0/.test(msg.text);

    await config.setUserConfig(db, userId, { newestOnly: !disable });

    return this.sendMessage(userId, `👍 You will receive ${disable ? 'all' : 'only newest'} updates`);
}

async function getDocumentsAndReply(msg, params) {
    return makeRequest.call(this, msg, 'get-documents', params);
}

async function makeRequest(msg, handler, params) {
    const userId = msg.from.id;

    console.profile(`fetch from API for ${handler}`);
    const res = await fetch(await buildUrl(msg, handler, params));
    const responseText = await res.text();
    console.profile(`fetch from API for ${handler}`);

    console.profile(`parse answer for ${handler}`);
    const data = JSON.parse(responseText);
    console.profile(`parse answer for ${handler}`);

    if (data.length && data[0].error) {
        throw new Error(data[0].error);
    }

    console.profile(`formatDocuments for ${handler}`);
    const docs = await formatter.formatDocuments(data);
    console.profile(`formatDocuments for ${handler}`);

    console.profile(`send messages for ${handler}`);
    for (let doc of docs) {
        await this.sendMessage(userId, doc);
    }
    console.profile(`send messages for ${handler}`);

    if (!docs.length) {
        await this.sendMessage(userId, '👵 Nothing new for this request');
    }

    console.profile('save last date');
    await saveLastDate(msg, data);
    console.profile('save last date');
}

async function getDigestAndReply(msg, params) {
    return makeRequest.call(this, msg, 'get-digest', params);
}

async function getButtons() {
    const categories = await getCategories();

    const buttons = categories.reduce((res, name) => {
        const command = `/cat ${name}`;
        res[command] = { label: command };
        return res;
    }, {});

    Object.assign(buttons, {
        '/digest': { label: '/digest' },
        '/help': { label: '/help' },
        '/nokeys': { label: '/nokeys' },
    });

    return buttons;
}

async function getCategories() {
    console.profile('get categories');

    const res = await fetch(`${config.apiUrl}/get-categories`);
    const responseText = await res.text();

    const data = JSON.parse(responseText).map(doc => doc.name);

    console.profile('get categories');
    return data;
}

async function saveLastDate(msg, data) {
    const msgText = msg.text || '';
    if (!config.storeData || msgText.startsWith('/query')) {
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

    const key = getLastDateKey(msg);
    if (key) {
        return collection.updateOne({ key }, { key, val: lastDate }, { upsert: true });
    }
}

async function getLastDate(msg) {
    const msgText = msg.text || '';
    if (!config.storeData || msgText.startsWith('/query')) {
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

function getLastDateKeyPattern(msg) {
    return `^${msg.from.id}:${msg.from.username}`;
}

async function getMongo() {
    console.profile('get mongo');
    if (!_mongoDb) {
        const authConfig = config.mongoUser && config.mongoPassword ? {
            auth: {
                user: config.mongoUser,
                password: config.mongoPassword,
            }
        } : {};

        _mongoDb = await MongoClient.connect(
            `mongodb://${config.mongoHost}:${config.mongoPort}/${config.mongoDb}`,
            authConfig
        );

        const collection = _mongoDb.collection('last_published');
        await collection.createIndex({ key: 1 }, { unique: true, expireAfterSeconds: 10080 });
    }
    console.profile('get mongo');
    return _mongoDb;
}

function wrapHandler(handler) {
    return async function wrapper(msg) {
        console.profile(`exec handler ${handler.name}`);

        let res;
        try {
            res = await handler.call(this, msg);
        } catch (err) {
            console.error(err);
            res = this.sendMessage(msg.from.id, `😿 We have an error:\n${err}`);
        }

        console.profile(`exec handler ${handler.name}`);
        return res;
    }
}

async function buildUrl(msg, handler, params = {}) {
    const db = await getMongo();

    const userId = msg.from.id;
    const userConfig = await config.getUserConfig(db, userId);

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
    const needLastDate = userConfig.newestOnly && msgText && !msgText.includes('!all');

    if (needLastDate) {
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
