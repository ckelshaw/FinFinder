import api from './api';

// Get fishing spots for a specific trip
export const fetchSpotForTrip = async (tripId) => {
    const res = await api.get(`/spots/trip/${tripId}`);
    return res.data;
};