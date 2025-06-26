import React from "react";
import { useState } from "react";
import RiverDropdown from "./components/RiverDropdown";
import RiverSearch from "./components/RiverSearch";
import DatePicker from "./components/DateInput";
import { format } from "date-fns";
import Navbar from "./Navbar";
import FishingConditions from "./components/FishingConditions";

function NewTrip() {
  const [river, setRiver] = useState("");
  const [riverId, setRiverId] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("New Trip");
  const [resetKey, setResetKey] = useState(false); //This is used to clear the dropdown if the user clicks the Clear button
  const [showPreview, setShowPreview] = useState(false);
  const [usgsSites, setUSGSSites] = useState([]);
  const [selectedUsgsSite, setSelectedUsgsSite] = useState([]);
  const [showStreamflowSelector, setShowStreamflowSelector] = useState(false);

  const handleRiverChange = (riverProp) => {
    if (riverProp) {
      setRiver(riverProp.label);
      setRiverId(riverProp.value);
    } else {
      setRiver(null);
      setTitle("New Trip");
    }
  };

  const handleStreamflowSelection = (site) => {
    setSelectedUsgsSite(site);
    setShowStreamflowSelector(false);
  }

  const handleDateChange = (datePicked) => {
    const formattedDate = format(datePicked, "MM/dd/yyy");
    setDate(formattedDate);
    generateTitle(river, formattedDate);
  };

  const generateTitle = (riverName, tripDate) => {
    if (riverName && tripDate) {
      setTitle(`${riverName} - ${tripDate}`);
    }
  };

  const handleUsgsSites = (usgsData, selectedRiver) => {
    console.log("Usgs sites: ", usgsData);
    console.log("Selected river: ", selectedRiver);
    setUSGSSites(usgsData);
    setRiver(selectedRiver);
    if(usgsData.length > 0) {
      setShowStreamflowSelector(true);
    }
  };

  const clearForm = () => {
    setRiver("");
    setDate("");
    setTitle("New Title");
    setResetKey((prev) => !prev);
    setShowPreview(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPreview(true);
    //add logic to save to db
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="container py-5">
        <div className="col-12 col-md-8 col-lg-6 mx-auto">
          <div className="card-body">
            <h2 className="fw-bold text-center text-uppercase text-primary mb-4">
              🎣 Plan Your Next Trip
            </h2>
            <h3
              id="trip-name"
              class="text-center text-uppercase text-secondary mb-4"
            >
              {title}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label class="form-label fs-6 fw-semibold">
                  Search your river
                </label>
                <RiverSearch onGetUsgsSites={handleUsgsSites} />
                {selectedUsgsSite && 
                  <p className="text-success">Selected USGS Site: {selectedUsgsSite.siteName}</p>
                }
                {usgsSites.length > 0 && showStreamflowSelector && (
                  <div className="container mt-4">
                    <div className="card shadow-sm p-4">
                      <h5 className="mb-3 text-center">
                        📍 USGS Streamflow Sites
                      </h5>
                      <ul className="list-group">
                        {usgsSites.map((site, index) => (
                          <li
                            key={index}
                            className="list-group-item hover-shade"
                            onClick={() => handleStreamflowSelection(site)}
                          >
                            {site.siteName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {/* <RiverDropdown
                    onSelect={handleRiverChange}
                    reset={resetKey}
                  /> */}
              </div>
              {river && (
                <div className="mb-4">
                  <label class="form-label fs-6 fw-semibold">
                    Select a date for your trip{" "}
                  </label>
                  <DatePicker onChange={handleDateChange} />
                </div>
              )}

              {river && date && !showPreview && (
                <div className="d-flex justify-content-between">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Go
                  </button>
                  <button
                    className="btn btn-outline-secondary rounded-pill px-4"
                    type="button"
                    onClick={clearForm}
                  >
                    Clear
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      {showPreview && (
        <FishingConditions
          riverName={river}
          riverId={riverId}
          date={date}
          title={title}
          onClear={clearForm}
          usgsSite={selectedUsgsSite}
        ></FishingConditions>
      )}
    </>
  );
}
export default NewTrip;
