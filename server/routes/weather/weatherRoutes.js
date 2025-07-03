import express from 'express';
import { fetchWeatherData } from '../../controllers/weather/weatherController.js';

const router = express.Router();

// Endpoint to fetch weather data based on location and date
// /api/weather/open-meteo?...
router.get('/open-meteo', fetchWeatherData);

export default router;