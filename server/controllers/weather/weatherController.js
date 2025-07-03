import axios from 'axios';
import { convertToISO, isValidFormat, cleanLatLong, formatWeatherResponse } from '../../utils/weatherConversions.js';

//Fetch historical or forcasted weather using open-meteo API

export const fetchWeatherData = async(req, res) => {
    let {lat, long, date, type} = req.query;
    const roundedLat = cleanLatLong(lat).toString();
    const roundedLong = cleanLatLong(long).toString();
    if(!isValidFormat(date)) { //Ensure our date is in ISO format 'YYYY-MM-DD'
        date = convertToISO(date);
    }
    const precipParam = type === 'forecast' ? "precipitation_probability_max" : "precipitation_sum";

    const baseURL = type === 'forecast'
       ? 'https://api.open-meteo.com/v1/forecast'
       : 'https://archive-api.open-meteo.com/v1/archive';

    try {
        // Return our weather data
        // max temp, min temp, sunrise, sunset, precipitation probability, wind speed, wind direction, pressure
        const response = await axios.get(baseURL, {
            params: {
                latitude: roundedLat,
                longitude: roundedLong,
                //daily: 'temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_sum',
                daily: `temperature_2m_max,temperature_2m_min,sunrise,sunset,${precipParam},wind_speed_10m_max,wind_direction_10m_dominant,surface_pressure_mean,wind_speed_10m_mean`,
                wind_speed_unit: 'mph',
                temperature_unit: 'fahrenheit',
                precipitation_unit: 'inch',
                start_date: date,
                end_date: date,
                timezone: 'auto'
            }
        });
        console.log("Unclean weather data: ", response.data.daily);
        const cleanedData = formatWeatherResponse(response.data.daily, type);
        res.status(200).json(cleanedData)
        console.log("Weather data fetched successfully: ", cleanedData);
    } catch (err) {
        console.error('Weather data fetch error: ', err);
        console.log(date);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
}