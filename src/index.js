require('dotenv').config()
const express = require('express')

const app = express()
app.use(express.json())

const openAI = require('./openAI')
const { MODELS } = require('./openAI')
const { getWeather, getWeatherByCoords } = require('./weather')
const { GET, POST } = require('./wa')
const { privacyPolicy, termsOfService } = require('./legal')

const query = process.env.GEO_QUERY

app.get('/privacy-policy', privacyPolicy)
app.get('/terms-of-service', termsOfService)
app.get('/wa', GET)
app.post('/wa', POST)

async function main() {
  const geoData = await getWeather(query)
  const lat = geoData.lat
  const lon = geoData.lon
  const weatherData = await getWeatherByCoords(lat, lon)

  const chatCompletion = await openAI.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          "You are a weather bot. Use only one measurement system depending on the country but no need to include country name on the reponse. Provide clothing recommendations based on the user's raw weather data:",
      },
      { role: 'user', content: weatherData },
    ],
    model: MODELS.GPT4_TURBO,
  })

  console.log(chatCompletion.choices[0].message.content)
}

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
