'use strict';
const handlers = require('./handlers');
const config = require('./config');
const TeleBot = require('telebot');

const bot = new TeleBot({
    token: config.token,
    usePlugins: ['namedButtons'],
    pluginConfig: {
        namedButtons: { buttons: handlers.eventButtons }
    }
});

for (let [event, listener] of Object.entries(handlers.listeners)) {
    bot.on('/' + event, listener.bind(bot));
}

bot.start();
