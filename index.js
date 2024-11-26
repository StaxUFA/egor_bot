const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const channelId = process.env.CHANNEL_ID; // ID или username канала, например, "@channelusername"

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

// Универсальная функция для отправки сообщения с кнопками
async function sendStartMenu(ctx) {
    const userId = ctx.from.id;

    const isSubscribed = await checkSubscription(userId, ctx);

    if (isSubscribed) {
        await ctx.reply(
            'Нажимайте на кнопку ниже, чтобы скачать файл 📚 с теорией по геометрии и примерами реальных задач! ✨',
            Markup.inlineKeyboard([
                [Markup.button.callback('📥 Скачать файл 1', 'file_1')],
               // [Markup.button.callback('📥 Скачать файл 2', 'file_2')],
            ])
        );
    } else {
        await ctx.reply(
            'Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!✅',
            Markup.inlineKeyboard([
                [Markup.button.url('🔗 Подписаться на канал', `https://t.me/${channelId.replace('@', '')}`)],
                [Markup.button.callback('🔄 Проверить подписку', 'check_subscription')],
            ])
        );
    }
}

bot.start(async (ctx) => {
    await sendStartMenu(ctx);
    await ctx.reply('✅ Обнял приподнял, в лобик поцеловал.', 
        Markup.keyboard([['🔄 Старт']])
            .resize()
            .oneTime(false)
    );
});

// Обработка кнопки "Проверить подписку"
bot.action('check_subscription', async (ctx) => {
    const userId = ctx.from.id;

    const isSubscribed = await checkSubscription(userId, ctx);

    if (isSubscribed) {
        ctx.editMessageText(
            'Нажимайте на кнопку ниже, чтобы скачать файл 📚 с теорией по геометрии и примерами реальных задач! ✨',
            Markup.inlineKeyboard([
                [Markup.button.callback('📥 Скачать файл по геометрии', 'file_1')],
                // [Markup.button.callback('📥 Скачать файл 2', 'file_2')],
            ])
        );
    } else {
        ctx.reply(
            'Упс!😱 Кажется, ты не подписался на канал! Подпишись и всё получится!',
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
    //    await ctx.reply('Загрузка файла началась, пожалуйста, подождите...');
  //      await ctx.replyWithDocument({ source: './files/file2.pdf', filename: 'file2.pdf' });
//    } catch (error) {
 //       console.error('Ошибка при отправке файла 2:', error);
 //       ctx.reply('Произошла ошибка при загрузке файла. Попробуйте позже.');
 //   }
//});

// Обработка текстовой кнопки "Старт"
bot.hears('🔄 Старт', async (ctx) => {
    await sendStartMenu(ctx);
});

// Запуск бота
bot.launch().then(() => console.log('Бот запущен!'));

// Обработка сигналов остановки
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
