import api from './api';

//Fetch weather data using open-meteo API
export const fetchWeatherData = async(lat, long, date, type) => {
    const response = await api.get('/weather/open-meteo', {
        params: {
            lat,
            long,
            date,
            type,
        },
    });
    return response.data;
}

export const fetchHistoricalWeatherData = async(lat, long, date, type) => {
    const response = await api.get('/weather/open-meteo', {
        params: {
            lat,
            long,
            date,
            type,
        },
    });
    return response.data;
}