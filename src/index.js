require('dotenv').config()
const express = require('express')
const { webhookCallback } = require('grammy')

const app = express()
app.use(express.json())

const telegramBot = require('./telegram')
const { GET, POST } = require('./wa')
const { privacyPolicy, termsOfService } = require('./legal')
const { deleteDataRequest, getDeletionStatus } = require('./deletion')

app.get('/privacy-policy', privacyPolicy)
app.get('/terms-of-service', termsOfService)
app.get('/wa', GET)
app.post('/wa', POST)
app.post('/meta/delete', deleteDataRequest)
app.get('/deletion', getDeletionStatus)

app.post('/telegram/webhook', webhookCallback(telegramBot, 'express'))

const port = process.env.PORT ?? 3000

app.listen(port, async () => {
  const isWebhookSet = await telegramBot.api.getWebhookInfo()
  if (isWebhookSet.url) {
    await telegramBot.api.deleteWebhook()
  }
  await telegramBot.api.setWebhook(
    'https://chatbot.bizler.group/telegram/webhook',
    {
      // secret_token: process.env.TELEGRAM_SECRET,
      drop_pending_updates: true,
    }
  )

  console.log(`Server started at http://localhost:${port}`)
})
