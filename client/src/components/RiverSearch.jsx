import React, {useState} from 'react';
import { searchGNISRivers, fetchUSGSStreamflow } from '../api/rivers';

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
    searchGNISRivers(river)
      .then((res) => {
        console.log('Fetched rivers', res);
        setRivers(res);
        if(res.length > 0) {
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

    fetchUSGSStreamflow(selectedRiver.river.feature_name)
      .then((res) => {
        setUSGSSites(res);
        onGetUsgsSites(res, selectedRiver) //Call back function with the USGS sites and the selected river to NewTrip.jsx
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