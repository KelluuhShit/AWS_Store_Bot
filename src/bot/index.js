const TelegramBot = require('node-telegram-bot-api');
const { getMainMenu, getVcpuMenu } = require('./keyboards');
const { WELCOME_MESSAGE } = require('./messages');
const { validateQuantity } = require('../utils/helpers');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const userState = new Map(); // Temporary in-memory user state

const startBot = () => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, WELCOME_MESSAGE, {
      reply_markup: getMainMenu(),
    });
  });

  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'buy') {
      bot.sendMessage(chatId, 'Select vCPU:', {
        reply_markup: getVcpuMenu(),
      });
    } else if (['5vcpu', '8vcpu', '32vcpu', '64vcpu'].includes(data)) {
      userState.set(chatId, { vcpu: data });
      bot.sendMessage(chatId, 'Enter quantity 🛍');
    }

    bot.answerCallbackQuery(query.id);
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text.startsWith('/')) {
      const state = userState.get(chatId);
      if (state && state.vcpu && !state.quantity) {
        const quantity = validateQuantity(text);
        if (quantity) {
          userState.set(chatId, { ...state, quantity });
          bot.sendMessage(chatId, 'Pay now 🛍', {
            reply_markup: {
              inline_keyboard: [[{ text: 'Pay Now', url: 'https://cryptomus.com' }]], // Placeholder URL
            },
          });
        } else {
          bot.sendMessage(chatId, 'Invalid quantity. Please enter a number.');
        }
      }
    }
  });
};

module.exports = { startBot };