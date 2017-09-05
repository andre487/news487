'use strict';
const handlers = require('./handlers');
const config = require('./config');
const TeleBot = require('telebot');

const bot = new TeleBot({
    token: config.token,
    allowedUpdates: [],
});

for (let [event, handler] of Object.entries(handlers)) {
    bot.on('/' + event, handler.bind(bot));
}

bot.start();
