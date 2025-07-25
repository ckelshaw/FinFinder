import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

const UploadPhotoModal = ({ show, onClose, onUpload, fishingSpots = [] }) => {
  const [photoMetadata, setPhotoMetadata] = useState([]);
  const user_id = useUser().id;
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Close modal on Esc
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

const handleFileChange = async (e) => {
  const selectedFiles = [...e.target.files];
  const compressedFiles = [];

  for (const file of selectedFiles) {
    let finalFile = file;

    // ✅ Convert HEIC to JPEG
    if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });

        finalFile = new File([convertedBlob], file.name.replace(/\.heic$/, '.jpeg'), {
          type: 'image/jpeg',
        });
      } catch (err) {
        console.error('HEIC conversion failed:', err);
        alert('Could not convert HEIC file. Try using JPEG or PNG.');
        continue;
      }
    }

    // ✅ Optional compression if needed
    if (finalFile.size > 5 * 1024 * 1024) {
      finalFile = await imageCompression(finalFile, {
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
    }

    compressedFiles.push({
      file: finalFile,
      spotId: '',
    });
  }

  setPhotoMetadata(compressedFiles);
};

  const handleSubmit = async () => {
    if (photoMetadata.length === 0) {
      alert("Please select at least one photo.");
      return;
    }
    setUploading(true);
    setProgress(0);

    try {
      await onUpload(photoMetadata, setProgress);
      setSuccess(true);
      setTimeout(() => {
        setPhotoMetadata([]);
        setProgress(0);
        setSuccess(false);
        setUploading(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please try again.");
      setUploading(false);
    }
    
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

            {uploading && ( //TODO: update styling
              <div className="my-3">
                <label className="form-label">Uploading...</label>
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {progress}%
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div
                className="alert alert-success mt-3 text-center"
                role="alert"
              >
                Photos uploaded successfully!
              </div>
            )}

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