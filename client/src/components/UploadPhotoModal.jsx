import React, { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const UploadPhotoModal = ({ show, onClose, onUpload, fishingSpots = [] }) => {
  const [photoMetadata, setPhotoMetadata] = React.useState([]);
  const user_id = useUser().id;

  useEffect(() => {
    // Close modal on Esc
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    const metadata = selectedFiles.map(file => ({
        file,
        spotId: '', //default is none since it is optional
        user_id: user_id,
    }));
    setPhotoMetadata(metadata);
  };

  const handleSubmit = () => {
    if (photoMetadata.length === 0) {
      alert("Please select at least one photo.");
      return;
    }
    onUpload(photoMetadata);
    setPhotoMetadata([]);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Upload Photos</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <label htmlFor="photoUpload" className="form-label">
                Select one or more photos:
              </label>
              <input
                id="photoUpload"
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                onChange={handleFileChange}
              />
              {photoMetadata.length > 0 && (
                <div className="row mt-3 g-3">
                  {photoMetadata.map((item, idx) => (
                    <div
                      key={idx}
                      className="col-6 col-md-4 col-lg-3 text-center"
                    >
                      <img
                        src={URL.createObjectURL(item.file)}
                        alt={`Preview ${idx}`}
                        className="img-thumbnail mb-2"
                        style={{
                          objectFit: "cover",
                          height: "150px",
                          width: "100%",
                        }}
                      />
                      <small className="d-block text-truncate mb-2">
                        {item.file.name}
                      </small>
                    {fishingSpots.length > 0 && (
                        <select
                        className="form-select"
                        value={item.spotId}
                        onChange={(e) => {
                          const updated = [...photoMetadata];
                          updated[idx].spotId = e.target.value;
                          setPhotoMetadata(updated);
                        }}
                      >
                        <option value="">No Spot</option>
                        {fishingSpots.map((spot) => (
                          <option key={spot.id} value={spot.id}>
                            {spot.name}
                          </option>
                        ))}
                      </select>
                    )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotoModal;