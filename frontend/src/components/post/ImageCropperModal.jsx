import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import {
  FaTimes,
  FaCheck,
  FaRedo,
  FaUndo,
  FaSearchPlus,
  FaSearchMinus,
  FaCropAlt,
  FaSyncAlt,
} from "react-icons/fa";

const ASPECT_RATIOS = [
  { label: "16:9 (Landscape)", value: 16 / 9 },
  { label: "4:3 (Standard)", value: 4 / 3 },
  { label: "1:1 (Square)", value: 1 / 1 },
  { label: "4:5 (Portrait)", value: 4 / 5 },
  { label: "Free / Original", value: null },
];

function ImageCropperModal({
  isOpen,
  imageSrc,
  fileName = "post_image.jpg",
  onCropComplete,
  onClose,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      setIsProcessing(true);
      const { file, url } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileName
      );
      onCropComplete({ file, url, aspect });
      onClose();
    } catch (err) {
      console.error("Error applying crop:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        className="ib-card overflow-hidden d-flex flex-column"
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "92vh",
          backgroundColor: "var(--ib-bg-surface)",
          borderRadius: "20px",
          border: "1px solid var(--ib-border)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between p-3.5 px-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(228, 35, 19, 0.12)",
                color: "#E42313",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaCropAlt size={14} />
            </div>
            <div>
              <h5 className="mb-0 font-weight-bold" style={{ fontSize: "1.05rem", color: "var(--ib-text-main)" }}>
                Adjust & Crop Image
              </h5>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Drag, zoom, rotate, and select the optimal aspect ratio
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "32px",
              height: "32px",
              background: "var(--ib-bg-surface-secondary)",
              border: "1px solid var(--ib-border)",
              color: "var(--ib-text-main)",
            }}
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Aspect Ratio Selector Tabs */}
        <div className="px-4 pt-3 pb-2 d-flex align-items-center gap-2 flex-wrap border-bottom">
          <span className="text-muted font-weight-bold mr-1" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>
            Ratio:
          </span>
          {ASPECT_RATIOS.map((r, idx) => {
            const isSelected = aspect === r.value;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setAspect(r.value)}
                className={`btn btn-sm px-2.5 py-1 rounded-pill font-weight-bold ${
                  isSelected ? "btn-ib-primary text-white" : "btn-ib-secondary"
                }`}
                style={{
                  fontSize: "0.75rem",
                  border: isSelected ? "none" : "1px solid var(--ib-border)",
                  transition: "all 0.15s ease",
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Cropper Container Area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "360px",
            minHeight: "260px",
            backgroundColor: "#0B0F19",
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect || undefined}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
            showGrid={true}
            style={{
              containerStyle: { background: "#090D16" },
              cropAreaStyle: {
                border: "2px solid #E42313",
                boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.65)",
              },
            }}
          />
        </div>

        {/* Controls Toolbar: Zoom, Rotate, Reset */}
        <div className="p-3.5 px-4 d-flex flex-column gap-3 border-top bg-surface-secondary">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            {/* Zoom Slider */}
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: "180px", maxWidth: "300px" }}>
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
                className="btn btn-sm p-1 border-0 text-muted"
                title="Zoom Out"
              >
                <FaSearchMinus size={13} />
              </button>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="form-range flex-grow-1"
                style={{ cursor: "pointer", accentColor: "#E42313" }}
              />
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                className="btn btn-sm p-1 border-0 text-muted"
                title="Zoom In"
              >
                <FaSearchPlus size={13} />
              </button>
              <small className="text-muted font-weight-bold" style={{ fontSize: "0.75rem", minWidth: "32px" }}>
                {zoom.toFixed(1)}x
              </small>
            </div>

            {/* Rotation & Reset Actions */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5"
                style={{ fontSize: "0.78rem" }}
                title="Rotate 90° Left"
              >
                <FaUndo size={10} />
                <span>Rotate Left</span>
              </button>

              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5"
                style={{ fontSize: "0.78rem" }}
                title="Rotate 90° Right"
              >
                <FaRedo size={10} />
                <span>Rotate Right</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "30px", height: "30px", padding: 0 }}
                title="Reset All Adjustments"
              >
                <FaSyncAlt size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3 px-4 d-flex align-items-center justify-content-between border-top">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-outline-secondary rounded-pill px-3.5 py-1.5 font-weight-bold"
            style={{ fontSize: "0.82rem" }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApplyCrop}
            className="btn btn-sm btn-ib-primary rounded-pill px-4 py-1.5 font-weight-bold d-flex align-items-center gap-1.5 shadow-sm"
            style={{ fontSize: "0.85rem" }}
          >
            <FaCheck size={11} />
            <span>{isProcessing ? "Cropping..." : "Apply & Save Crop"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropperModal;
