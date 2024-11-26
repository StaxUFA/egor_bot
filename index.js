const express = require('express');
const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

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

  // Проверка подписки (для примера, можно заменить на реальную логику проверки подписки)
  const isSubscribed = true; // Замените на свою логику

  if (isSubscribed) {
    await ctx.reply('Добро пожаловать! Вы подписаны на канал. Выберите файл для скачивания:', Markup.inlineKeyboard([
      [Markup.button.callback('📥 Скачать файл 1', 'file_1')],
    //  [Markup.button.callback('📥 Скачать файл 2', 'file_2')]
    ]));
  } else {
    await ctx.reply('Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅', Markup.inlineKeyboard([
      [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${process.env.CHANNEL_ID}`)],
      [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')]
    ]));
  }

  // Добавляем кнопку "Старт" внизу
  await ctx.reply('Если что-то пошло не так, нажмите "Старт"!', Markup.keyboard([['🔄 Старт']]).resize().oneTime(false));
});

// Обработка кнопки "Проверить подписку"
bot.action('check_subscription', async (ctx) => {
  const userId = ctx.from.id;
  
  const isSubscribed = true; // Замените на вашу логику

  if (isSubscribed) {
    await ctx.reply('Теперь вы можете скачать файлы!', Markup.inlineKeyboard([
      [Markup.button.callback('📥 Скачать файл 1', 'file_1')],
      //[Markup.button.callback('📥 Скачать файл 2', 'file_2')]
    ]));
  } else {
    await ctx.reply('Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅', Markup.inlineKeyboard([
      [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${process.env.CHANNEL_ID}`)],
      [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
      [Markup.button.callback('🔄 Старт', 'start')]
    ]));
  }
});

// Обработчики для кнопок скачивания файлов
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
 // try {
 //   await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
 //   await ctx.replyWithDocument({ source: './files/file2.pdf', filename: 'file2.pdf' });
//  } catch (error) {
 //   console.error('Ошибка при отправке файла 2:', error);
 //   ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
 // }
//});

// Кнопка "Старт" внизу
bot.action('start', async (ctx) => {
  // Перезапуск работы бота и вывод кнопок скачивания
  const userId = ctx.from.id;
  
  // Проверка подписки (для примера, можно заменить на реальную логику проверки подписки)
  const isSubscribed = true; // Замените на вашу логику

  if (isSubscribed) {
    await ctx.reply('Добро пожаловать! Вы подписаны на канал. Выберите файл для скачивания:', Markup.inlineKeyboard([
      [Markup.button.callback('📥 Скачать файл 1', 'file_1')],
      [Markup.button.callback('📥 Скачать файл 2', 'file_2')]
    ]));
  } else {
    await ctx.reply('Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅', Markup.inlineKeyboard([
      [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${process.env.CHANNEL_ID}`)],
      [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')]
    ]));
  }

  // Внизу снова кнопка старта
  await ctx.reply('Если что-то пошло не так, нажмите "Старт"!', Markup.keyboard([['🔄 Старт']]).resize().oneTime(false));
});

// Запуск сервера Express
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
