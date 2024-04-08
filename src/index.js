require('dotenv').config()
const express = require('express')

const app = express()
app.use(express.json())

const openAI = require('./openAI')
const { MODELS } = require('./openAI')
const { getWeather, getWeatherByCoords } = require('./weather')
const { GET, POST } = require('./wa')
const { privacyPolicy, termsOfService } = require('./legal')
const { weatherChatSystemMessage } = require('./util')
const { deleteDataRequest, getDeletionStatus } = require('./deletion')

const query = process.env.GEO_QUERY

app.get('/privacy-policy', privacyPolicy)
app.get('/terms-of-service', termsOfService)
app.get('/wa', GET)
app.post('/wa', POST)
app.post('/meta/delete', deleteDataRequest)
app.get('/deletion', getDeletionStatus)

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

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
