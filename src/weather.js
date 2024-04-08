const BASE_URL = 'http://api.openweathermap.org'
const API_KEY = process.env.OPENWEATHER_API_KEY

module.exports.getWeather = async (query) => {
  const url = new URL(`${BASE_URL}/geo/1.0/direct`)
  url.searchParams.append('q', query)
  url.searchParams.append('limit', '1')
  url.searchParams.append('appid', API_KEY)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = (await response.json()) ?? []

  return data[0]
}

module.exports.getWeatherByCoords = async (lat, lon) => {
  const url = new URL(`${BASE_URL}/data/2.5/weather`)
  url.searchParams.append('lat', lat)
  url.searchParams.append('lon', lon)
  url.searchParams.append('appid', API_KEY)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return await response.text()
}
