const core = require('@actions/core')
const OpenAI = require('openai')
const grammy = require('grammy')
const { getWeather, getWeatherByCoords } = require('./weather')
const { weatherChatSystemMessage } = require('./util')

async function run() {
  const telegram_bot_token = core.getInput('telegram_bot_token')
  const telegram_admin_id = core.getInput('telegram_admin_id')
  const openweather_api_key = core.getInput('openweather_api_key')
  const geo_query = core.getInput('geo_query')
  const openai_api_key = core.getInput('openai_api_key')

  const openai = new OpenAI({ apiKey: openai_api_key })
  const bot = new grammy.Bot(telegram_bot_token)

  try {
    const data = await getWeather(geo_query, openweather_api_key)
    const weatherDataStr = await getWeatherByCoords(
      data.lat,
      data.lon,
      openweather_api_key
    )

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: weatherChatSystemMessage },
        { role: 'user', content: weatherDataStr },
      ],
    })

    const message = chatCompletion.choices[0].message.content

    await bot.api.sendMessage(telegram_admin_id, message)

    core.setOutput('result', true)
  } catch (error) {
    core.error(`Error ${error}, action may still succeed though`)
    core.setFailed(`Action failed with error ${error}`)
  }
}

run()
