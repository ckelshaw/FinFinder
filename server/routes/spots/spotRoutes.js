// routes/spotsRoutes.js
import express from 'express';
import { getSpotsForTrip } from '../../controllers/spots/spotsController.js';

const router = express.Router();

router.get('/trip/:tripId', getSpotsForTrip);

export default router;