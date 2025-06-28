import express from 'express';
import axios from 'axios';

const router = express.Router();

// This route fetches rivers from the Idaho GNIS API based on a query parameter for river name and state name.
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
            where: `feature_class='Stream' AND feature_name LIKE '%${feature_name}%' AND state_name='${state_name}'`, //filter by stream/river, feature_name matches our input, and state_name matches the input
            outFields: "feature_id,feature_class,feature_name", //returns feature_id, feature_class, feature_name
            f: "pjson", //output in JSON format
          },
        });
        const results = response.data.features.map((f) => ({ //map to feature_name and feature_id
          feature_name: f.attributes.feature_name,
          feature_id: f.attributes.feature_id,
        }));
        res.json(results);
    } catch (err) {
        console.error('GNIS fetch error: ', err);
        res.status(500).json({ error: 'Failed to fetch rivers from GNIS' });
    }
});

export default router;