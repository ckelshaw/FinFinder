import express from 'express';
import {
  getUSGSStreamflow,
  searchGNISRivers,
  getUSGSLatLng
} from '../../controllers/rivers/riverController.js';

const router = express.Router();

// /api/rivers/usgs?stateCd=...&riverName=...&...
router.get('/usgs', getUSGSStreamflow);

router.get('/usgs-get-lat-lng', getUSGSLatLng);

// /api/rivers/gnis?feature_name=...&state_name=...
router.get('/gnis', searchGNISRivers);

export default router;