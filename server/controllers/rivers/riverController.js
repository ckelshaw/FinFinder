import axios from 'axios';

// This controller fetches streamflow data from the USGS API (streamflow data)
// based on a query parameter for river name, state, and other optional parameters.
export const getUSGSStreamflow = async (req, res) => {
  const {
    stateCd,
    siteStatus,
    siteType,
    parameterCd,
    format,
    riverName,
    siteCode,
    startDate,
    endDate,
  } = req.query;

  if (!stateCd || !siteStatus || !siteType || !parameterCd) {
    return res.status(400).json({
      error: 'Missing stateCd, siteStatus, siteType, or parameterCd',
    });
  }

  // Base Url for the USGS API request
  let url = `https://waterservices.usgs.gov/nwis/iv/?format=${format}&siteStatus=${siteStatus}&siteType=${siteType}&parameterCd=${parameterCd}`;

  if (siteCode) {
    // If we have the siteCode we add it as that means we are searching for a specific site
    url += `&sites=${siteCode}&startDT=${startDate}&endDT=${endDate}`;
  } else {
    // If no siteCode, we add the stateCd to the URL as that means we are filtering by state
    url += `&stateCd=${stateCd}`;
  }

  try {
    const response = await axios.get(url);
    console.log('USGS river data:', response.data);
    const timeSeries = response.data?.value?.timeSeries;

    if (!Array.isArray(timeSeries)) {
      return res.status(404).json({ error: 'No streamflow data found.' });
    }

    const filtered = timeSeries
      .filter((s) =>
        s.sourceInfo?.siteName?.toLowerCase().includes(riverName.toLowerCase())
      )
      .map((site) => {
        const flow = site.values?.[0]?.value?.[0];
        return {
          siteName: site.sourceInfo.siteName,
          siteCode: site.sourceInfo.siteCode?.[0]?.value,
          latitude: site.sourceInfo.geoLocation.geogLocation.latitude,
          longitude: site.sourceInfo.geoLocation.geogLocation.longitude,
          flow: flow?.value || null,
          dateTime: flow?.dateTime || null,
        };
      });
      console.log('Filtered USGS data:', filtered);
    res.json(filtered);
  } catch (err) {
    console.error('USGS Water Data API error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// This controller fetches rivers from the Idaho GNIS API
// based on a query parameter for river name and state name.
export const searchGNISRivers = async (req, res) => {
  const { feature_name, state_name } = req.query;

  const url =
    'https://gis1.idl.idaho.gov/arcgis/rest/services/Portal/Idaho_GNIS/FeatureServer/0/query';

  if (!feature_name || !state_name) {
    return res
      .status(400)
      .json({ error: 'Missing feature_name or state_name' });
  }

  try {
    const response = await axios.get(url, {
      params: {
        where: `feature_class='Stream' AND feature_name LIKE '%${feature_name}%' AND state_name='${state_name}'`,
        outFields: 'feature_id,feature_class,feature_name',
        f: 'pjson',
      },
    });

    const results = response.data.features.map((f) => ({
      feature_name: f.attributes.feature_name,
      feature_id: f.attributes.feature_id,
    }));
    res.json(results);
  } catch (err) {
    console.error('GNIS fetch error: ', err);
    res.status(500).json({ error: 'Failed to fetch rivers from GNIS' });
  }
};