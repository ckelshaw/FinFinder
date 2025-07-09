import React, {useState, useEffect} from 'react';
import { updateTripRating } from '../api/trips';
import Rating from 'react-rating';
import { MdOutlineStarBorder, MdOutlineStar, MdOutlineStarHalf } from 'react-icons/md';

function TripRating ( {trip, userId, readOnly }) {

  const [rating, setRating] = useState(trip.rating ?? null);

  const handleRatingChange = (newRating) => {
  setRating(newRating);
  console.log(newRating);
  updateTripRating({ id: trip.trip_id, user_id: userId, rating: newRating })
    .then(() => console.log("Rating saved"))
    .catch(err => console.error("Failed to update rating", err));
};

    return (
        <div className="d-flex align-items-center gap-2 mt-3">
          <span className="fw-semibold white">Rate this Trip:</span>
          <Rating
            initialRating={rating}
            fractions={2} // Supports half-stars
            onChange={handleRatingChange}
            readonly={readOnly}
            emptySymbol={<MdOutlineStarBorder size={30} className="text-secondary" />}
            fullSymbol={<MdOutlineStar size={30} className="text-warning" />}
            halfSymbol={<MdOutlineStarHalf size={30} className="text-warning" />}
          />
        </div>
      );
}

export default TripRating;
