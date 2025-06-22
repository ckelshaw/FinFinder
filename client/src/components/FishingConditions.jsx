import React, { useEffect, useState } from "react";
import mockConditions from "../MockConditions";
import Navbar from "../Navbar";
import placeholderMap from '../Assets/placeHolderImage.jpg'

function FishingConditions(riverName){
    const [temp, setTemp] = useState('');
    const [bPressure, setBPressure] = useState('');
    const [streamFlow, setStreamFlow] = useState('');
    const [wind, setWind] = useState('');

    useEffect(() => {
        //Loading our mock data
        setTemp(mockConditions.temp)
        setBPressure(mockConditions.barometric_pressure)
        setStreamFlow(mockConditions.stream_flow)
        setWind(mockConditions.wind_mph)
    }, [])

    return (
      <>
        <Navbar></Navbar>
        <div className="card shadow-sm p-4 mt-4">
          <h4 className="text-center mb-4">🎣 Conditions</h4>
          <div className="row">
            {/* Left Column */}
            <div className="col-12 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">{riverName}</h5>
              <p className="mb-2">
                <strong>Stream Flow:</strong> {streamFlow} cfs
              </p>
              <h6 className="mt-4 mb-2">Forecast</h6>
              <p className="mb-1">
                <strong>Temperature:</strong> {temp}°F
              </p>
              <p className="mb-1">
                <strong>Wind Speed:</strong> {wind} mph
              </p>
              <p className="mb-1">
                <strong>Barometric Pressure:</strong> {bPressure}
              </p>
            </div>

            {/* Right Column */}
            <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
              <img
                src={placeholderMap}
                alt="Map preview"
                className="img-fluid rounded shadow-sm"
                style={{
                  maxHeight: "250px",
                  objectFit: "cover",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>
      </>
    );

}

export default FishingConditions;