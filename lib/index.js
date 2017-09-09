'use strict';
const handlers = require('./handlers');
const config = require('./config');
const TeleBot = require('telebot');

const bot = new TeleBot({
    token: config.token,
    usePlugins: ['commandButton'],
});

for (let [event, handler] of Object.entries(handlers)) {
    bot.on('/' + event, handler.bind(bot));
}

bot.on('text', msg => {
    if (!msg.text.startsWith('/')) {
        return handlers.help.call(bot, msg);
    }
});

bot.on('callbackQuery', msg => {
    return bot.answerCallbackQuery(msg.id);
});

bot.start();
