require('dotenv').config()
const express = require('express')
const { webhookCallback } = require('grammy')

const app = express()
app.use(express.json())

const openAI = require('./openAI')
const telegramBot = require('./telegram')
const { getWeather, getWeatherByCoords } = require('./weather')
const { GET, POST } = require('./wa')
const { privacyPolicy, termsOfService } = require('./legal')
const { weatherChatSystemMessage } = require('./util')
const { deleteDataRequest, getDeletionStatus } = require('./deletion')

const query = process.env.GEO_QUERY

MODELS = {
  GPT3: 'gpt-3.5-turbo',
  GPT4: 'gpt-4',
  GPT4_TURBO: 'gpt-4-turbo-preview',
}

app.get('/privacy-policy', privacyPolicy)
app.get('/terms-of-service', termsOfService)
app.get('/wa', GET)
app.post('/wa', POST)
app.post('/meta/delete', deleteDataRequest)
app.get('/deletion', getDeletionStatus)

app.post('/telegram/webhook', webhookCallback(telegramBot, 'express'))

async function main() {
  const geoData = await getWeather(query)
  const lat = geoData.lat
  const lon = geoData.lon
  const weatherDataStr = await getWeatherByCoords(lat, lon)

  const chatCompletion = await openAI.chat.completions.create({
    messages: [
      { role: 'system', content: weatherChatSystemMessage },
      { role: 'user', content: weatherDataStr },
    ],
    model: MODELS.GPT4_TURBO,
  })

  console.log(chatCompletion.choices[0].message.content)
}

telegramBot.command('start', async (ctx) => {
  await ctx.reply(
    'Hello buddy!\n/weather to get help with weather.\n/wear to get help with what to wear.'
  )
})

telegramBot.command('weather', async (ctx) => {
  const geoData = await getWeather(query)
  const lat = geoData.lat
  const lon = geoData.lon
  const weatherDataStr = await getWeatherByCoords(lat, lon)

  await ctx.reply('```json\n' + weatherDataStr + '\n```', {
    parse_mode: 'MarkdownV2',
  })
})

telegramBot.command('wear', async (ctx) => {
  const geoData = await getWeather(query)
  const lat = geoData.lat
  const lon = geoData.lon
  await ctx.replyWithChatAction('typing')
  const weatherDataStr = await getWeatherByCoords(lat, lon)

  const chatCompletion = await openAI.chat.completions.create({
    messages: [
      { role: 'system', content: weatherChatSystemMessage },
      { role: 'user', content: weatherDataStr },
    ],
    model: MODELS.GPT4_TURBO,
  })

  await ctx.reply(chatCompletion.choices[0].message.content, {
    parse_mode: 'MarkdownV2',
  })
})

const port = process.env.PORT ?? 3000

app.listen(port, async () => {
  // const isWebhookSet = await telegramBot.api.getWebhookInfo()
  // if (isWebhookSet.url) {
  //   await telegramBot.api.deleteWebhook()
  // }
  // await telegramBot.api.setWebhook(
  //   'https://chatbot.bizler.group/telegram/webhook'
  //   // {
  //   //   secret_token: process.env.TELEGRAM_SECRET,
  //   // }
  // )

  console.log(`Server started at http://localhost:${port}`)
})
