import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
    const {
        feature_name,
        state_name
    } = req.query;
    const url = 'https://gis1.idl.idaho.gov/arcgis/rest/services/Portal/Idaho_GNIS/FeatureServer/0/query';

    if (!feature_name || !state_name) {
    return res.status(400).json({ error: 'Missing feature_name or state_name' });
  }

    try {
        const response = await axios.get(url, {
          params: {
            where: `feature_class='Stream' AND feature_name LIKE '%${feature_name}%' AND state_name='${state_name}'`,
            outFields: "feature_id,feature_class,feature_name",
            f: "pjson",
          },
        });
        const results = response.data.features.map(f => f.attributes.feature_name)
        res.json(results);
    } catch (err) {
        console.error('GNIS fetch error: ', err);
        res.status(500).json({ error: 'Failed to fetch rivers from GNIS' });
    }
});

export default router;