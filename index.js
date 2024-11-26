// Импортируем необходимые библиотеки
const express = require('express');
const { Telegraf } = require('telegraf');
require('dotenv').config();

// Создаем экземпляры Express и Telegraf
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Для парсинга JSON тела запросов от Telegram
app.use(express.json());

// Обработчик для главной страницы (чтобы проверить, работает ли сервер)
app.get('/', (req, res) => {
  res.send('Bot is live and working!');
});

// Обработчик для получения обновлений от Telegram через Webhook
app.post(`/${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body)
    .then(() => {
      res.sendStatus(200); // Ответ успешный, Telegram знает, что запрос обработан
    })
    .catch(err => {
      console.error('Ошибка при обработке обновлений:', err);
      res.sendStatus(500); // В случае ошибки на сервере
    });
});

// Настроим Webhook для бота
const webhookUrl = `https://egor-bot.onrender.com/${process.env.BOT_TOKEN}`;
bot.telegram.setWebhook(webhookUrl).then(() => {
  console.log('Webhook установлен на:', webhookUrl);
});

// Команда /start
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  
  // Здесь ваша логика для проверки подписки и предоставления кнопок
  ctx.reply('Привет! Добро пожаловать в бота!');

  // Кнопки для взаимодействия
  ctx.reply('Выберите опцию:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📥 Скачать файл 1', callback_data: 'file_1' }],
      //  [{ text: '📥 Скачать файл 2', callback_data: 'file_2' }]
      ]
    }
  });
});

// Обработчики для кнопок
bot.action('file_1', async (ctx) => {
  try {
    await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
    await ctx.replyWithDocument({ source: './files/geom.pdf', filename: 'geom.pdf' });
  } catch (error) {
    console.error('Ошибка при отправке файла 1:', error);
    ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
  }
});

 //bot.action('file_2', async (ctx) => {
   //try {
   //  await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
  //   await ctx.replyWithDocument({ source: './files/file2.pdf', filename: 'file2.pdf' });
  // } catch (error) {
  //   console.error('Ошибка при отправке файла 2:', error);
    // ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
  // }
 //});

// Запуск сервера Express
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
