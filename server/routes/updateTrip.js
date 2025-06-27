import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Endpoint to update the stream flow for a given trip
router.patch('/update-trip', async (req, res) => {
    const {
        id,
        stream_flow,
        user_id
    } = req.body;
    try {
        console.log("Updating trip with new flow rate: ", stream_flow);
    // Step 1: Verify the trip belongs to the user
    const { data: trip, error: fetchError } = await supabase
      .from('fishing_trip')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!trip || trip.user_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized access to trip.' });
    }
    // Step 2: Update the trip
    const { data, error } = await supabase
      .from('conditions')
      .update({ stream_flow })
      .eq('trip_id', id)
      .select();
    if (error) throw error;

    res.status(200).json({ message: 'Trip updated successfully.', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;