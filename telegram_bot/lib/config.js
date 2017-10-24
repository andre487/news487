'use strict';
const env = process.env;

const config = {
    token: env.TELEGRAM_TOKEN,
    apiUrl: env.API_URL,
    gooGlKey: env.GOO_GL_KEY,

    storeData: Boolean(env.MONGO_HOST || env.MONGO_PORT || env.MONGO_DB),
    mongoHost: env.MONGO_HOST || 'localhost',
    mongoPort: env.MONGO_PORT || 27017,
    mongoUser: env.MONGO_USER,
    mongoPassword: env.MONGO_PASSWORD,
    mongoDb: env.MONGO_DB || 'news_bot_487',

    tz: env.TZ || 'Europe/Moscow',
    shortenLinks: env.SHORTEN_LINKS,

    getUserConfig,
    setUserConfig,
};

async function getUserConfig(db, userId) {
    const res = await db.collection('user_config').findOne({ userId });

    return res ? res : {};
}

async function setUserConfig(db, userId, config) {
    const collection = db.collection('user_config');

    await Promise.all([
        collection.createIndex(
            { userId: 1 },
            { unique: true, expireAfterSeconds: 31536000 }
        ),
        collection.updateOne(
            { userId },
            Object.assign({ userId }, config),
            { upsert: true }
        )
    ]);
}

module.exports = config;
