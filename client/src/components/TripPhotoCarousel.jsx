import React, { useEffect, useState } from 'react';
import { getTripPhotos } from '../api/trips'; // adjust the path if needed

const TripPhotoCarousel = ({ tripId, photoRefreshSignal }) => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!tripId) return;
    getTripPhotos(tripId)
      .then(setPhotos)
      .catch((err) => console.error('Failed to fetch trip photos:', err));
  }, [tripId, photoRefreshSignal]);

  if (photos.length === 0) return null;

  return (
    <div className="mt-4">
      <h5 className="text-center text-white">Trip Photos</h5>
      <div className="d-flex overflow-auto gap-3 px-3">
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={photo.photo_url}
            alt="Trip"
            className="rounded shadow-sm"
            style={{
              height: '150px',
              width: 'auto',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TripPhotoCarousel;