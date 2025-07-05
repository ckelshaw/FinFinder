import React from 'react';
import './FishingConditions.scss';

function WeatherForecast({maxTemp, minTemp, wind, windGusts, windDirection, precipChance, bPressure, sunrise, sunset}){


    return (
        <>
        <div className="row border-top pt-3 weather-forecast">
              <h4 className="text-center honolulu-blue mb-4">Forecast</h4>

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
                  <div className="value">{precipChance}%</div>
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
                  <div className="value">{sunrise}</div>
                </div>
                <div className="forecast-line border-bottom pb-1 mb-2">
                  <div className="label">
                    <i className="bi bi-sunset me-2"></i>Sunset
                  </div>
                  <div className="value">{sunset}</div>
                </div>
              </div>
            </div>
        </>
    )
}

export default WeatherForecast;