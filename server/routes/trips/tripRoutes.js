import express from 'express';
import multer from 'multer';
import {
  createTrip,
  markTripAsCompleted,
  updateTripStreamFlow,
  updatePostTripNotes,
  getTripsByUser,
  getTripById,
  updateTripWeather,
  updateTripRating,
  uploadTripPhotos,
  getTripPhotos,
} from '../../controllers/trips/tripController.js';

const router = express.Router();

router.get('/user/:user_id', getTripsByUser); // Endpoint to get all trips for a given user
router.get('/:trip_id', getTripById); // Endpoint to get a specific trip by ID
router.post('/', createTrip);  // Endpoint to create a new trip, with conditions for the trip
router.patch('/mark-as-completed', markTripAsCompleted); // Endpoint to mark a trip as completed
router.patch('/update-trip', updateTripStreamFlow); // Endpoint to update the stream flow for a given trip
router.patch('/update-post-trip-notes', updatePostTripNotes); // Endpoint to update post-trip notes for a given trip
router.patch('/update-weather', updateTripWeather); // Endpoint to update weather conditions for a given trip
router.patch('/update-trip-rating', updateTripRating); //Endpoint to update a trips rating

const upload = multer({ storage: multer.memoryStorage() }); //Keeps photos in memory for upload to db
router.post('/:tripId/upload-photo',
  upload.array('photos'),
  uploadTripPhotos
); 
router.get('/:tripId/photos', getTripPhotos); //Endpoint to get photos for a given trip


export default router;