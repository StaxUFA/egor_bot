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

// Функция для проверки подписки
async function checkSubscription(userId, ctx) {
  try {
    const member = await ctx.telegram.getChatMember(process.env.CHANNEL_ID, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error('Ошибка проверки подписки:', error);
    return false;
  }
}

// Функция для обработки команды /start и кнопки "🔄 Старт"
async function handleStartCommand(ctx) {
  const userId = ctx.from.id;
  const isSubscribed = await checkSubscription(userId, ctx);

  if (isSubscribed) {
    await ctx.reply(
      'Нажимайте на кнопку ниже, чтобы скачать файл 📚 с теорией по геометрии и примерами реальных задач! ✨',
      Markup.inlineKeyboard([
        [Markup.button.callback('📥 Скачать файл по геометрии', 'file_1')],
       // [Markup.button.callback('📥 Скачать файл 2', 'file_2')],
      ])
    );
  } else {
    await ctx.reply(
      'Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅',
      Markup.inlineKeyboard([
        [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${process.env.CHANNEL_ID.replace('@', '')}`)],
        [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
      ])
    );
  }

  // Добавляем кнопку "Старт" внизу
  await ctx.reply(
    'Если что-то пошло не так, нажмите "Старт"!',
    Markup.keyboard([['🔄 Старт']]).resize().oneTime(false)
  );
}

// Команда /start
bot.start(handleStartCommand);

// Обработка текстового ввода для кнопки "🔄 Старт"
bot.hears('🔄 Старт', handleStartCommand);

// Обработка кнопки "Проверить подписку"
bot.action('check_subscription', async (ctx) => {
  const userId = ctx.from.id;
  const isSubscribed = await checkSubscription(userId, ctx);

  if (isSubscribed) {
    await ctx.reply(
      'Нажимайте на кнопку ниже, чтобы скачать файл 📚 с теорией по геометрии и примерами реальных задач! ✨',
      Markup.inlineKeyboard([
        [Markup.button.callback('📥 Скачать файл по геометрии', 'file_1')],
       // [Markup.button.callback('📥 Скачать файл 2', 'file_2')],
      ])
    );
  } else {
    await ctx.reply(
      'Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅',
      Markup.inlineKeyboard([
        [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${process.env.CHANNEL_ID.replace('@', '')}`)],
        [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
      ])
    );
  }
});

// Обработчики для кнопок скачивания файлов с проверкой подписки
bot.action('file_1', async (ctx) => {
  const userId = ctx.from.id;
  const isSubscribed = await checkSubscription(userId, ctx);

  if (isSubscribed) {
    try {
      await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
      await ctx.replyWithDocument({ source: './files/geom.pdf', filename: 'geom.pdf' });
    } catch (error) {
      console.error('Ошибка при отправке файла 1:', error);
      ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
    }
  } else {
    await ctx.reply(
      'Для скачивания файла нужно подписаться на мой канал! ✅',
      Markup.inlineKeyboard([
        [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${process.env.CHANNEL_ID.replace('@', '')}`)],
        [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
      ])
    );
  }
});

// bot.action('file_2', async (ctx) => {
 // const userId = ctx.from.id;
 // const isSubscribed = await checkSubscription(userId, ctx);

 // if (isSubscribed) {
    //try {
   //   await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
   //   await ctx.replyWithDocument({ source: './files/file2.pdf', filename: 'file2.pdf' });
  //  } catch (error) {
   //   console.error('Ошибка при отправке файла 2:', error);
   //   ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
   // }
  //} else {
  //  await ctx.reply(
  //    'Для скачивания файла нужно подписаться на наш канал! ✅',
   //   Markup.inlineKeyboard([
  //      [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${process.env.CHANNEL_ID.replace('@', '')}`)],
  //      [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
//      ])
 //   );
 // }
//});

// Запуск сервера Express
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
