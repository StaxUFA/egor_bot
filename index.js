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
  
  // Проверка подписки или предложения подписаться
  // Для примера просто проверим, что бот отвечает
  const isSubscribed = true; // Замените вашу логику проверки подписки здесь

  if (isSubscribed) {
    ctx.reply('Добро пожаловать! Вы подписаны на канал. Выберите файл для скачивания:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📥 Скачать файл 1', callback_data: 'file_1' }],
          [{ text: '📥 Скачать файл по геометрии', callback_data: 'file_2' }]
        ]
      }
    });
  } else {
    ctx.reply('Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 Подписаться на канал', url: `https://t.me/${process.env.CHANNEL_ID}` }],
          [{ text: '🔄 Проверить подписку', callback_data: 'check_subscription' }],
          [{ text: '🔄 Старт', callback_data: 'start' }]
        ]
      }
    });
  }

  // Добавляем кнопку "Старт" внизу
  ctx.reply('Если что-то пошло не так, нажмите "Старт"!', {
    reply_markup: {
      keyboard: [
        ['🔄 Старт']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});

// Обработка кнопки "Проверить подписку"
bot.action('check_subscription', async (ctx) => {
  const userId = ctx.from.id;
  
  const isSubscribed = true; // Замените на свою логику

  if (isSubscribed) {
    ctx.reply('Теперь вы можете скачать файлы!', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📥 Скачать файл 1', callback_data: 'file_1' }],
         //   [{ text: '📥 Скачать файл 2', callback_data: 'file_2' }]
        ]
      }
    });
  } else {
    ctx.reply('Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 Подписаться на канал', url: `https://t.me/${process.env.CHANNEL_ID}` }],
          [{ text: '🔄 Проверить подписку', callback_data: 'check_subscription' }],
          [{ text: '🔄 Старт', callback_data: 'start' }]
        ]
      }
    });
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

 // bot.action('file_2', async (ctx) => {
  //  try {
   //   await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
  //    await ctx.replyWithDocument({ source: './files/file2.pdf', filename: 'file2.pdf' });
  //  } catch (error) {
  //    console.error('Ошибка при отправке файла 2:', error);
    //  ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
   // }
 // });

// Кнопка "Старт" внизу
bot.action('start', async (ctx) => {
  ctx.reply('Добро пожаловать! Выберите файл для скачивания:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📥 Скачать файл по геометрии', callback_data: 'file_1' }],
      //  [{ text: '📥 Скачать файл 2', callback_data: 'file_2' }]
      ]
    }
  });
});

// Запуск сервера Express
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
