import React, { useState } from 'react';

function USGSSites({ usgsSites, onSiteSelect }) { //Component to display and select USGS sites

    const [selectedSite, setSelectedSite] = useState([]);

    const handleSelectSite = (selectedSite) => { //Pass in the selected site, set it, and call the parent's onSiteSelect method with the selected site.
        setSelectedSite(selectedSite);
        onSiteSelect(selectedSite); //Callback function to NewTrip.jsx
    }

    return (
      <>
        <div className="mt-4">
          <h5 className="text-center fw-semibold mb-3 white">
            Select a USGS Site
          </h5>
          <div className="list-group shadow-sm rounded" style={{maxHeight: "200px", overflowY:"auto", scrollbarGutter: 'stable'}}>
            {usgsSites.map((site, index) => (
              <button
                key={index}
                type="button"
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                onClick={() => handleSelectSite(site)}
              >
                <div>
                  <strong className='dark-blue'>{site.siteName}</strong>
                  <div className="text-muted small">
                    {site.siteCode} | {site.latitude.toFixed(4)},{" "}
                    {site.longitude.toFixed(4)}
                  </div>
                </div>
                <span className="badge custom-flow-badge rounded-pill">
                  {site.flow} cfs
                </span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
}

export default USGSSites;