const grammy = require('grammy')

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const bot = new grammy.Bot(TOKEN)

bot.catch((err) => {
  err.ctx.reply('An error occurred. Please try again later.')
  console.log('An error occurred:', err)
})

module.exports = bot
