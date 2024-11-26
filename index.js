const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const app = express();
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const channelId = process.env.CHANNEL_ID;  // ID или username канала, например, "@channelusername"

// Функция проверки подписки
async function checkSubscription(userId, ctx) {
    try {
        const member = await ctx.telegram.getChatMember(channelId, userId);
        return ['member', 'administrator', 'creator'].includes(member.status);
    } catch (error) {
        console.error('Ошибка проверки подписки:', error);
        return false;
    }
}

// Команда /start
bot.start(async (ctx) => {
    const userId = ctx.from.id;

    const isSubscribed = await checkSubscription(userId, ctx);

    if (isSubscribed) {
        ctx.reply(
            'Добро пожаловать! Вы подписаны на канал. Выберите файл для скачивания:',
            Markup.inlineKeyboard([
                [Markup.button.callback('📥 Скачать файл 1', 'file_1')],
               // [Markup.button.callback('📥 Скачать файл 2', 'file_2')],
            ])
        );
    } else {
        ctx.reply(
            'Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅',
            Markup.inlineKeyboard([
                [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${channelId.replace('@', '')}`)],
                [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
            ])
        );
    }
});

// Обработка кнопки "Проверить подписку"
bot.action('check_subscription', async (ctx) => {
    const userId = ctx.from.id;

    const isSubscribed = await checkSubscription(userId, ctx);

    if (isSubscribed) {
        ctx.editMessageText(
            'Нажимайте на кнопку ниже, чтобы скачать файл 📚 с теорией по геометрии и примерами реальных задач! ✨',
            Markup.inlineKeyboard([
                [Markup.button.callback('📥 Скачать файл 1', 'file_1')],
               // [Markup.button.callback('📥 Скачать файл 2', 'file_2')],
            ])
        );
    } else {
        ctx.reply(
            'Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅',
            Markup.inlineKeyboard([
                [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${channelId.replace('@', '')}`)],
                [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
            ])
        );
    }
});

// Обработчики кнопок для скачивания файлов
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
  //  try {
   //     await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
  //      await ctx.replyWithDocument({ source: './files/file2.pdf', filename: 'file2.pdf' });
 //   } catch (error) {
 //       console.error('Ошибка при отправке файла 2:', error);
  //      ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
  //  }
//});

// Настройка Webhook


const webhookUrl = `http://egor-bot.onrender.com/${process.env.BOT_TOKEN}`;
bot.telegram.setWebhook(webhookUrl);

// Обработчик для webhook
app.use(bot.webhookCallback(`/`));

// Запуск сервера на порту, предоставленном платформой (например, Heroku или Render)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
