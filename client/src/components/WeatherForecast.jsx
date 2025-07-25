import React from 'react';
import './FishingConditions.scss';
import { format } from 'date-fns';

function WeatherForecast({maxTemp, minTemp, wind, windGusts, windDirection, precipChance, bPressure, sunrise, sunset, actualPrecipitation, tripDate}) {
  const formattedSunrise = new Date(sunrise).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const formattedSunset = new Date(sunset).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const today = format(new Date(), 'yyy-MM-dd');

    return (
        <>
        <div className="row pt-1 weather-forecast">
          {tripDate < today ? (
            <h2 className="text-center white mb-4">Forecast</h2>
          ) : (
            <h2 className="text-center white mb-4">Weather</h2>
          )}
              

              <div className="col-md-6 mb-2">
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-thermometer-high me-2"></i>High
                  </div>
                  <div className="value">{maxTemp}°</div>
                </div>
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-thermometer-low me-2"></i>Low
                  </div>
                  <div className="value">{minTemp}°</div>
                </div>
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-wind me-2"></i>Wind
                  </div>
                  <div className="value">
                    {wind} mph {windDirection}
                  </div>
                </div>
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-arrow-right me-2"></i>Gusts
                  </div>
                  <div className="value">{windGusts} mph</div>
                </div>
              </div>

              <div className="col-md-6 mb-2">
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-cloud-drizzle me-2"></i>Precipitation
                  </div>
                  {actualPrecipitation === undefined || actualPrecipitation === null ? ( //If no actualPrecipitation show the precipChance, otherwise show the actualPrecipitation
                  <div className="value">{precipChance}%</div>
                  ) : (
                    <div className="value">{`${actualPrecipitation} in`}</div>
                  )}
                </div>
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-speedometer me-2"></i>Pressure
                  </div>
                  <div className="value">{bPressure} in</div>
                </div>
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-sunrise me-2"></i>Sunrise
                  </div>
                  <div className="value">{formattedSunrise}</div>
                </div>
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-sunset me-2"></i>Sunset
                  </div>
                  <div className="value">{formattedSunset}</div>
                </div>
              </div>
            </div>
        </>
    )
}

export default WeatherForecast;