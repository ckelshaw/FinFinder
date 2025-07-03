//Converts barometric pressure from Pascals to inches
export const convertPressureToInches = (pressure) => {
    pressure = parseFloat(pressure);
    return pressure * 0.029530795013727448;
 }

 //Converts wind direction from degrees to compass points
 export const degreesToCompass = (deg) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export const isValidFormat = (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateStr);
};

export const convertToISO = (dateStr) => {
  const delimiter = dateStr.includes('/') ? '/' : '-';
  const [month, day, year] = dateStr.split(delimiter);
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export const cleanLatLong = (latLong) => {
  // Round latitude or longitude to 6 decimal places for weather api call
  const cleanLatLong = parseFloat(latLong).toFixed(6);
  return cleanLatLong;
}

export const formatWeatherResponse = (weatherData, type) => {
  const precipitation = type === 'forecast'
    ? weatherData.precipitation_probability_max?.[0]
    : weatherData.precipitation_sum?.[0];
  return {
    time: weatherData.time?.[0],
    maxTemp: weatherData.temperature_2m_max?.[0],
    minTemp: weatherData.temperature_2m_min?.[0],
    sunrise: weatherData.sunrise?.[0],
    sunset: weatherData.sunset?.[0],
    precipitation,
    windGusts: weatherData.wind_speed_10m_max?.[0],
    windDirection: degreesToCompass(weatherData.wind_direction_10m_dominant?.[0]),
    bPressure: convertPressureToInches(weatherData.surface_pressure_mean?.[0]),
    windSpeed: weatherData.wind_speed_10m_mean?.[0],
  }
}