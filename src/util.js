module.exports.prompt = (data) => {
  const text = `Given the following weather conditions:
      - Temperature: ${data.temperature}°C
      - Weather: ${data.weather}
      - Time of day: ${data.time}
      - Wind speed: ${data.windSpeed} km/h
      - Humidity: ${data.humidity}%

      What would be the appropriate clothing recommendations for someone who will be outdoors in ${data.city} under these conditions?`

  return text.trim()
}
