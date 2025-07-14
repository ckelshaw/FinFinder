import supabase from '../../supabaseClient.js';

// Get Spots for Trip
export const getSpotsForTrip = async (req, res) => {
  const { tripId } = req.params;

  try {
    const { data, error } = await supabase
      .from('trip_spots')
      .select('fishing_spot(id, name, latitude, longitude)')
      .eq('trip_id', tripId);

    if (error) throw error;

    const spots = data.map(entry => entry.fishing_spot);
    res.status(200).json(spots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};