import React from "react";
import { useState } from "react";
import RiverSearch from "../components/RiverSearch";
import DatePicker from "../components/DateInput";
import { format } from "date-fns";
import Navbar from "../components/Navbar";
import FishingConditions from "../components/FishingConditions";
import USGSSites from "../components/USGSSites";
import LeafletMap from "../components/LeafletMap";

function NewTrip() {
  const [river, setRiver] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState('');
  const [resetKey, setResetKey] = useState(false); //This is used to clear the dropdown if the user clicks the Clear button
  const [showPreview, setShowPreview] = useState(false);
  const [usgsSites, setUSGSSites] = useState([]);
  const [selectedUsgsSite, setSelectedUsgsSite] = useState(null);
  const [showStreamflowSelector, setShowStreamflowSelector] = useState(false);
  const [showUSGSMessage, setShowUSGSMessage] = useState(false);
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [fishingSpots, setFishingSpots] = useState([]); //lat, lng, river, name
  const [focusedSpot, setFocusedSpot] = useState(null);

  const handleStreamflowSelection = (site) => { //When user selects a USGS site from the dropdown
    setSelectedUsgsSite(site);
    setShowStreamflowSelector(false);
    setShowUSGSMessage(true); //Show the text that displays the USGS site after the dropdown dissappears
  }

  const handleDateChange = (datePicked) => { //When user selects a date from the date picker
    const formattedDate = format(datePicked, "MM/dd/yyy");
    setDate(formattedDate);
    generateTitle(river, formattedDate); //Generate the title based on the river and the selected date
  };

  const generateTitle = (river, tripDate) => { //River name + date
    if (river.river.feature_name && tripDate) {
      setTitle(`${river.river.feature_name} - ${tripDate}`);
    }
  };

  const handleUsgsSites = (usgsData, selectedRiver) => { //Handler function to handle the USGS site data from RiverSearch component
    setUSGSSites(usgsData);
    setRiver(selectedRiver);
    if(usgsData.length > 0) {
      setShowStreamflowSelector(true); //Show the dropdown with USGS sites after fetching the data
    }
  };

  const handleMapClick = (spot) => {
    console.log(`lat and long: ${spot.lat}, ${spot.lng} for ${spot.name}`);
    setFishingSpots([...fishingSpots, spot]);
    setIsAddingSpot(false);
  }

  const clearForm = () => { //Clear the form and reset the state
    setRiver("");
    setDate("");
    setTitle("New Title");
    setResetKey((prev) => !prev);
    setShowPreview(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const selectSpot = (spot) => {
    console.log(`fishing spot lat and long: ${spot.lat}, ${spot.lng}`);
    setFocusedSpot(spot);
  }

  return (
    <>
      <Navbar></Navbar>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-12">
            <div className="card shadow-lg p-4">
              {!title && (
                <h2 className="fw-bold text-center text-uppercase mb-4 white">
                  Plan Your Next Trip
                </h2>
              )}
              {title && (
                <h3
                  id="trip-name"
                  className="text-center text-uppercase white mb-4"
                >
                  {title}
                </h3>
              )}
              <div className="row g-1">
                {/* Left side: Form + Conditions */}

                <div className="col-md-6 p-1" style={{ position: "relative" }}>
                  {isAddingSpot && (
                    <div className="add-spot-overlay">
                      <h3 className="dark-blue">
                        Click on the map to place your fishing spot
                      </h3>
                    </div>
                  )}
                  <div
                    className={`trip-form-wrapper ${
                      isAddingSpot ? "blurred" : ""
                    }`}
                  >
                    {" "}
                    {/*If the user is adding a spot grey out the rest */}
                    {!showPreview && (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <RiverSearch onGetUsgsSites={handleUsgsSites} />
                          {showUSGSMessage && (
                            <p className="text-success">
                              Selected USGS Site: {selectedUsgsSite.siteName}
                            </p>
                          )}
                          {usgsSites.length > 0 && showStreamflowSelector && (
                            <USGSSites
                              usgsSites={usgsSites}
                              onSiteSelect={handleStreamflowSelection}
                            />
                          )}
                        </div>

                        {river && (
                          <div className="mb-4">
                            <DatePicker onChange={handleDateChange} />
                          </div>
                        )}

                        {river && date && !showPreview && (
                          <div className="d-flex justify-content-between">
                            <button
                              type="submit"
                              className="btn primary-button rounded-pill px-4"
                            >
                              Go
                            </button>
                            <button
                              className="btn btn-outline-light rounded-pill px-4"
                              type="button"
                              onClick={clearForm}
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </form>
                    )}
                    {/* Preview Conditions if ready */}
                    {showPreview && (
                      <div className="">
                        <FishingConditions
                          riverName={river?.river?.feature_name}
                          riverId={river?.river?.feature_id}
                          date={date}
                          title={title}
                          onClear={clearForm}
                          usgsSite={selectedUsgsSite}
                          showSaveBtn={true}
                          tripCreation={true}
                          fishingSpots={fishingSpots}
                          selectedSpot={selectSpot}
                        />
                      </div>
                    )}
                    
                  </div>
                </div>
                {/* Right side: Map and Add Fishing Spot Button */}
                <div
                  className="col-md-6 d-flex flex-column"
                  style={{ minHeight: "300px" }}
                >
                  <div className="flex-grow-1 border rounded mb-3">
                    <LeafletMap
                      key={selectedUsgsSite?.siteCode || "all"}
                      sites={usgsSites}
                      selectedSite={selectedUsgsSite}
                      onSiteSelect={handleStreamflowSelection}
                      showForecast={showPreview}
                      showButton={true}
                      onAddFishingSpot={handleMapClick}
                      isAddingSpot={isAddingSpot}
                      fishingSpots={fishingSpots}
                      focusedSpot={focusedSpot}
                    />
                  </div>
                  {showPreview && !isAddingSpot && (
                    <div className="text-end">
                      <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={() => setIsAddingSpot(true)}
                      >
                        Add a Fishing Spot
                      </button>
                    </div>
                  )}
                  {isAddingSpot && (
                    <div className="text-end">
                      <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={() => setIsAddingSpot(false)}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default NewTrip;
