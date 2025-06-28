import api from './api';

// Search rivers from GNIS
export const searchGNISRivers = async (feature_name, state_name = 'Idaho') => { //TODO: get the state from the selected river in the future
  const response = await api.get('/rivers/gnis', {
    params: { feature_name, state_name },
  });
  console.log('GNIS rivers:', response.data);
  return response.data;
};

// Get USGS streamflow data
export const fetchUSGSStreamflow = async (riverName) => { //TODO: get the state from the selected river in the future
  const response = await api.get('/rivers/usgs', {
    params: {
      stateCd: 'ID',
      siteType: 'ST',
      parameterCd: '00060',
      siteStatus: 'active',
      format: 'json',
      riverName,
    },
  });
  return response.data;
};

// Fetch historical USGS data by siteCode and date
export const fetchHistoricalUSGSData = async ({ riverName, siteCode, date }) => {
  const res = await api.get('/rivers/usgs', {
    params: {
      stateCd: 'ID', //TODO: get the state from the selected river in the future
      siteType: 'ST',
      parameterCd: '00060',
      siteStatus: 'active',
      format: 'json',
      riverName,
      siteCode,
      startDate: date,
      endDate: date,
    },
  });
  return res;
};