'use strict';
const env = process.env;

module.exports = {
    token: env.TELEGRAM_TOKEN,
    apiUrl: env.API_URL,
    gooGlKey: env.GOO_GL_KEY,

    storeData: Boolean(env.MONGO_HOST || env.MONGO_PORT || env.MONGO_DB),
    mongoHost: env.MONGO_HOST || 'localhost',
    mongoPort: env.MONGO_PORT || 27017,
    mongoDb: env.MONGO_DB || 'news_bot_487',

    tz: env.TZ || 'Europe/Moscow',
    shortenLinks: env.SHORTEN_LINKS,
};
