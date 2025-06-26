import React, {useState} from 'react';
import axios from "axios";

function RiverSearch({ onGetUsgsSites }) {
  const [riverName, setRiverName] = useState('');
  const [selectedRiver, setSelectedRiver] = useState(null);
  const [rivers, setRivers] = useState([]);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [usgsSites, setUSGSSites] = useState([]);

  const handleRiverSearch = (e) => {
    const value = e.target.value;
    setRiverName(value);
    if (value.trim().length > 1) {
      fetchRiver(value);
      setShowDropdown(true);
    } else {
      setRivers([]);
      setShowDropdown(false);
    }
  };

  const fetchRiver = (river) => {
    axios
      .get('/api/search-rivers', {
        params: {
          feature_name: river,
          state_name: 'Idaho',
        },
      })
      .then((res) => {
        setRivers(res.data);
      })
      .catch((err) => {
        console.log('Failed to fetch river: ', err);
      });
  };

  const findUSGSData = (selectedRiver) => {
    setRiverName(selectedRiver.feature_name);
    setSelectedRiver(selectedRiver);
    setShowDropdown(false);

    axios
      .get('/api/search-usgs', {
        params: {
          stateCd: 'ID',
          siteType: 'ST',
          parameterCd: '00060',
          siteStatus: 'active',
          format: 'json',
          riverName: selectedRiver.feature_name,
        },
      })
      .then((res) => {
        console.log('Fetched USGS sites', res.data);
        setUSGSSites(res.data);
        onGetUsgsSites(res.data, selectedRiver)
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
            onFocus={() => setShowDropdown(results.length > 0)}
          />
        </div>
        {showDropdown && rivers.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
            {results.map((river, index) => (
              <li
                key={index}
                className="list-group-item hover-shade"
                style={{ cursor: 'pointer' }}
                onClick={() => findUSGSData({ name: river.feature_name, id: river.feature_id })}
              >
                {river}
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