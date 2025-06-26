import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const {
    user_id,
    river_id,
    date,
    title,
    preTripNotes,
    temp,
    bPressure,
    streamFlow,
    wind
  } = req.body;

  try {
    // Step 1: Insert trip
    const { data: tripData, error: tripError } = await supabase
      .from('fishing_trip')
      .insert([
        {
          user_id,
          river: river_id,
          date,
          title,
          pre_trip_notes: preTripNotes
        }
      ])
      .select();

    if (tripError) throw tripError;

    const trip_id = tripData[0].id;

    // Step 2: Insert conditions linked to trip
    const { data: conditionsData, error: conditionsError } = await supabase
      .from('conditions')
      .insert([
        {
          trip_id,
          temp,
          barometric_pressure: bPressure,
          stream_flow: streamFlow,
          wind_mph: wind
        }
      ])
      .select();

    if (conditionsError) throw conditionsError;

    res.status(201).json({
      message: 'Trip and conditions saved',
      trip: tripData[0],
      conditions: conditionsData[0]
    });

  } catch (error) {
    console.error('Insert error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;