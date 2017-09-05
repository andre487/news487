'use strict';
const env = process.env;

module.exports = {
    token: env.TELEGRAM_TOKEN,
    api_url: env.API_URL,

    store_data: Boolean(env.MONGO_HOST || env.MONGO_PORT || env.MONGO_DB),
    mongo_host: env.MONGO_HOST || 'localhost',
    mongo_port: env.MONGO_PORT || 27017,
    mongo_db: env.MONGO_DB || 'news_bot_487',
};
