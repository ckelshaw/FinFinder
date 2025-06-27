import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Endpoint to mark a trip as completed
router.patch('/mark-as-completed', async (req, res) => {
    const {
        id,
        completed,
        user_id
    } = req.body;
    try {
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
      .from('fishing_trip')
      .update({ completed })
      .eq('id', id);
    if (error) throw error;

    res.status(200).json({ message: 'Trip updated successfully.', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;