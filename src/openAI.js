const OpenAI = require('openai')

exports.MODELS = {
  GPT3: 'gpt-3.5-turbo',
  GPT4: 'gpt-4',
  GPT4_TURBO: 'gpt-4-turbo-preview',
}

module.exports = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
