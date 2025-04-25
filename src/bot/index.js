const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { getMainMenu, getVcpuMenu } = require('./keyboards');
const { WELCOME_MESSAGE } = require('./messages');
const { validateQuantity } = require('../utils/helpers');

const token = process.env.TELEGRAM_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL; // e.g., https://your-app.onrender.com
const port = process.env.PORT || 3000;

if (!token || !webhookUrl) {
  console.error('Error: TELEGRAM_TOKEN or WEBHOOK_URL missing');
  process.exit(1);
}

const bot = new TelegramBot(token);
const app = express();
const userState = new Map();

app.use(express.json());

// Set Telegram webhook
bot.setWebHook(`${webhookUrl}/bot${token}`)
  .then(() => console.log('Webhook set successfully'))
  .catch((err) => console.error('Webhook setup error:', err));

// Handle Telegram updates
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot logic
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
            inline_keyboard: [[{ text: 'Pay Now', url: 'https://cryptomus.com' }]],
          },
        });
      } else {
        bot.sendMessage(chatId, 'Invalid quantity. Please enter a number.');
      }
    }
  }
});

// Start server
app.listen(port, () => {
  console.log(`Bot server running on port ${port}`);
});

module.exports = { startBot: () => console.log('Bot started in webhook mode') };