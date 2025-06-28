import express from 'express';
import {
  getUSGSStreamflow,
  searchGNISRivers,
} from '../../controllers/rivers/riverController.js';

const router = express.Router();

// /api/rivers/usgs?stateCd=...&riverName=...&...
router.get('/usgs', getUSGSStreamflow);

// /api/rivers/gnis?feature_name=...&state_name=...
router.get('/gnis', searchGNISRivers);

export default router;