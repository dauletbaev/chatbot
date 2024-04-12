const grammy = require('grammy')

const openAI = require('./openAI')
const { weatherChatSystemMessage } = require('./util')
const { getWeather, getWeatherByCoords } = require('./weather')

let admins

try {
  admins = JSON.parse(process.env.TELEGRAM_ADMINS)
} catch (error) {
  console.error('Error parsing TELEGRAM_ADMINS:', error)
  admins = []
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const MODELS = {
  GPT3: 'gpt-3.5-turbo',
  GPT4: 'gpt-4',
  GPT4_TURBO: 'gpt-4-turbo',
}

const bot = new grammy.Bot(TOKEN)

bot
  .filter((ctx) => !admins.includes(ctx.from.id))
  .command('start', async (ctx) => {
    await ctx.reply('Sorry, you are not authorized to use this bot.')
  })

const onlyAdmin = bot.filter((ctx) => admins.includes(ctx.from.id))

onlyAdmin.command('start', async (ctx) => {
  await ctx.reply(
    'Hello buddy!\n/weather to get help with weather.\n/wear to get help with what to wear.'
  )
})

onlyAdmin.command('weather', async (ctx) => {
  const geoData = await getWeather(process.env.GEO_QUERY)
  const lat = geoData.lat
  const lon = geoData.lon
  const weatherDataStr = await getWeatherByCoords(lat, lon)
  const niceFormatted = JSON.stringify(JSON.parse(weatherDataStr), null, 2)

  await ctx.reply('```json\n' + niceFormatted + '\n```', {
    parse_mode: 'MarkdownV2',
  })
})

onlyAdmin.command('wear', async (ctx) => {
  const geoData = await getWeather(process.env.GEO_QUERY)
  const lat = geoData.lat
  const lon = geoData.lon
  await ctx.replyWithChatAction('typing')
  const weatherDataStr = await getWeatherByCoords(lat, lon)

  const chatCompletion = await openAI.chat.completions.create({
    model: MODELS.GPT4_TURBO,
    messages: [
      { role: 'system', content: weatherChatSystemMessage },
      { role: 'user', content: weatherDataStr },
    ],
  })

  const message = chatCompletion.choices[0].message.content
  await ctx.reply(message)
})

bot.catch((err) => {
  err.ctx.reply('An error occurred. Please try again later.')
  console.log('An error occurred:', err)
})

module.exports = bot
