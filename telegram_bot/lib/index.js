'use strict';
const handlers = require('./handlers');
const config = require('./config');
const TeleBot = require('telebot');

require('./log');

async function main() {
    console.profile('start');

    const bot = new TeleBot({
        token: config.token,
        usePlugins: ['namedButtons'],
        polling: {
            timeout: 10000,
            retryTimeout: 5000,
        },
        pluginConfig: {
            namedButtons: {
                buttons: await handlers.getButtons()
            }
        }
    });

    for (let [event, listener] of Object.entries(handlers.listeners)) {
        bot.on('/' + event, listener.bind(bot));
    }

    bot.start();

    console.profile('start');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
