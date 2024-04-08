const grammy = require('grammy')

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const bot = new grammy.Bot(TOKEN)

module.exports = bot
