import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
    const {
        stateCd,
        siteStatus,
        siteType,
        parameterCd,
        format,
        riverName
    } = req.query;

    const url = `https://waterservices.usgs.gov/nwis/iv/?format=${format}&stateCd=${stateCd}&siteStatus=${siteStatus}&siteType=${siteType}&parameterCd=${parameterCd}`;

    if(!stateCd ||!siteStatus ||!siteType ||!parameterCd) {
        return res.status(400).json({ error: 'Missing stateCd, siteStatus, siteType, or parameterCd' });
    }

    try {
    const response = await axios.get(url);
    console.log(response.data);

    const timeSeries = response.data?.value?.timeSeries;

    if (!Array.isArray(timeSeries)) {
      return res.status(404).json({ error: 'No streamflow data found.' });
    }

    const filtered = timeSeries
      .filter(s => s.sourceInfo?.siteName?.toLowerCase().includes(riverName.toLowerCase()))
      .map(site => {
        const flow = site.values?.[0]?.value?.[0];
        return {
          siteName: site.sourceInfo.siteName,
          siteCode: site.sourceInfo.siteCode?.[0]?.value,
          latitude: site.sourceInfo.geoLocation.geogLocation.latitude,
          longitude: site.sourceInfo.geoLocation.geogLocation.longitude,
          flow: flow?.value || null,
          dateTime: flow?.dateTime || null
        };
      });

    res.json(filtered);
    } catch (err) {
        console.error('USGS Water Data API error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;