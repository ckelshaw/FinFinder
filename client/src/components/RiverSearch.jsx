import React, {useState} from 'react';
import axios from "axios";

function RiverSearch({ onGetUsgsSites }) {
  const [riverName, setRiverName] = useState('');
  const [selectedRiver, setSelectedRiver] = useState(null);
  const [rivers, setRivers] = useState([]);
  //const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [usgsSites, setUSGSSites] = useState([]);

  const handleRiverSearch = (e) => { //Searching for rivers from GNIS based on user input 
    const value = e.target.value;
    setRiverName(value);
    if (value.trim().length > 1) {
      fetchRiver(value);
      setShowDropdown(true); //Dropdown is populated with list of rivers from GNIS that match user input.
    } else {
      setRivers([]);
      setShowDropdown(false);
    }
  };

  const fetchRiver = (river) => { //We are making a GET request to the server to fetch rivers from GNIS based on the user input.
    axios
      .get('/api/search-rivers', {
        params: {
          feature_name: river,
          state_name: 'Idaho', //TODO: get the state from the selected river or maybe the user in the future
        },
      })
      .then((res) => {
        setRivers(res.data);
        if(res.data.length > 0) {
            setShowDropdown(true);
        }
        console.log("response data:", res.data)
      })
      .catch((err) => {
        console.log('Failed to fetch river: ', err);
      });
  };

  const findUSGSData = (selectedRiver) => { //We take the selected river from the dropdown and make a GET request to the server to fetch possible USGS sites based on the selected river.
    setRiverName(selectedRiver.river.feature_name);
    setSelectedRiver(selectedRiver);
    setShowDropdown(false);

    axios
      .get('/api/search-usgs', {
        params: {
          stateCd: 'ID', //TODO: get the state from the selected river in the future
          siteType: 'ST', //Searches for only stream/river sites
          parameterCd: '00060', //Searches for only gauging stations
          siteStatus: 'active', //Filter out inactive sites
          format: 'json',
          riverName: selectedRiver.river.feature_name, //Pass in the river name to have our fuzzy match against gauging stations
        },
      })
      .then((res) => {
        console.log('Fetched USGS sites', res.data);
        setUSGSSites(res.data);
        onGetUsgsSites(res.data, selectedRiver) //Call back function with the USGS sites and the selected river to NewTrip.jsx
      })
      .catch((err) => {
        console.log('Failed to pull USGS sites: ', err);
      });
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4 position-relative">
        <h5 className="mb-3 text-center">🔍 Search for a River</h5>
        <div className="mb-3 position-relative">
          <label htmlFor="riverSearch" className="form-label fw-semibold">
            River Name
          </label>
          <div className="position-relative">
          <input
            type="search"
            id="riverSearch"
            className="form-control"
            placeholder="e.g. Boise River"
            value={riverName}
            onChange={handleRiverSearch}
            onFocus={() => setShowDropdown(rivers.length > 0)}
          />
        </div>
        {showDropdown && rivers.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
            {rivers.map((river, index) => (
              <li
                key={index}
                className="list-group-item hover-shade"
                style={{ cursor: 'pointer' }}
                onClick={() => findUSGSData({ river })}
              >
                {river.feature_name}
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </div>
  );
}

export default RiverSearch;