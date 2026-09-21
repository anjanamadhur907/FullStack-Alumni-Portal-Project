import { useState, useRef } from "react";
import Navbar from "../nav/Nav";
import axiosInstance from "../axios-config/api";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import ImageCropperModal from "./ImageCropperModal";
import {
  FaImage,
  FaLightbulb,
  FaCalendarAlt,
  FaBullhorn,
  FaTrash,
  FaPaperPlane,
  FaArrowLeft,
  FaLock,
  FaCropAlt,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";

const CATEGORIES = [
  { id: "General", label: "General", icon: FaLightbulb, color: "#E42313" },
  { id: "Event", label: "Event", icon: FaCalendarAlt, color: "#D97706" },
  { id: "Announcement", label: "Announcement", icon: FaBullhorn, color: "#005DA6" },
];

function Post() {
  const { isLoggedIn, currentUser, profile_data } = useSelector((store) => store.user);
  const isAdmin =
    isLoggedIn &&
    (currentUser?.is_admin ||
      currentUser?.role === "Admin" ||
      profile_data?.role === "Admin" ||
      localStorage.getItem("is_admin") === "true" ||
      sessionStorage.getItem("admin_active") === "true");
  const isAlumni =
    isLoggedIn &&
    (profile_data?.role === "Alumni" || currentUser?.role === "Alumni");
  const canPost = isAlumni || isAdmin;

  const [category, setCategory] = useState("General");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Image Cropping & Adjusting States
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [rawFileName, setRawFileName] = useState("post_image.jpg");
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawFileName(file.name || "post_image.jpg");
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result);
        // Initially set preview and open cropper so user can adjust
        setSelectedFile(file);
        setImagePreview(reader.result);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = ({ file, url }) => {
    setSelectedFile(file);
    setImagePreview(url);
    toast.success("Image cropped and adjusted successfully!");
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    setRawImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for your post");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title);
      formData.append("content", content);
      if (selectedFile) {
        formData.append("post_image", selectedFile);
      }

      await axiosInstance.post("/post/", formData);
      toast.success("Post published successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (profile_data && !canPost) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
        <Navbar />
        <div className="container py-5" style={{ maxWidth: "680px" }}>
          <div className="ib-card p-5 text-center">
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#FEF3C7",
                color: "#D97706",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <FaLock size={24} />
            </div>
            <h4 className="brand-font font-weight-bold">Alumni Only</h4>
            <p className="text-muted mt-2 mb-4" style={{ fontSize: "0.92rem" }}>
              Only verified InfoBeans Foundation <strong>Alumni</strong> are authorized to publish new posts and updates.
            </p>
            <NavLink to="/" className="btn btn-ib-primary px-4 py-2 rounded-pill font-weight-bold" style={{ fontSize: "0.85rem" }}>
              ← Return to Home Feed
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
      <Navbar />

      <div className="container py-4" style={{ maxWidth: "760px" }}>
        <div className="mb-3">
          <NavLink to="/" className="text-muted font-weight-bold d-inline-flex align-items-center gap-1.5 text-decoration-none" style={{ fontSize: "0.85rem" }}>
            <FaArrowLeft size={11} />
            <span>Back to Feed</span>
          </NavLink>
        </div>

        <div className="ib-card overflow-hidden">
          <div
            className="p-4 text-white"
            style={{
              background: "linear-gradient(135deg, #1E2433 0%, #2A2F3D 60%, #1E2433 100%)",
              borderBottom: "3px solid #E42313",
            }}
          >
            <span
              className="badge px-2.5 py-1 mb-1.5 font-weight-bold"
              style={{
                background: isAdmin ? "#4F46E5" : "#E42313",
                color: "#FFF",
                fontSize: "0.72rem",
              }}
            >
              {isAdmin ? "Admin Publisher" : "Alumni Composer"}
            </span>
            <h3 className="brand-font text-white mb-0 font-weight-bold" style={{ fontSize: "1.45rem" }}>
              Create a Community Post
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Category Selector */}
            <div className="mb-3.5">
              <label className="text-muted font-weight-bold mb-2" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                Select Category
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`btn d-flex align-items-center gap-1.5 px-3.5 py-2 rounded-pill ${
                        isSelected ? "btn-ib-primary" : "btn-ib-secondary"
                      }`}
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={13} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Title */}
            <div className="mb-3">
              <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                Post Title *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  borderRadius: "10px",
                  fontSize: "0.92rem",
                  padding: "10px 14px",
                }}
              />
            </div>

            {/* Content */}
            <div className="mb-3">
              <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                Post Content
              </label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Write your post details, announcements, or thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  borderRadius: "10px",
                  fontSize: "0.88rem",
                  padding: "10px 14px",
                }}
              />
            </div>

            {/* Image Upload & Adjust */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <label className="text-muted font-weight-bold mb-0" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                  Post Image & Media
                </label>
                {imagePreview && (
                  <span className="badge badge-success px-2 py-0.5 rounded-pill d-inline-flex align-items-center gap-1" style={{ fontSize: "0.68rem" }}>
                    <FaCheckCircle size={9} /> Ready
                  </span>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 text-center rounded-lg d-flex flex-column align-items-center justify-content-center"
                  style={{
                    border: "2px dashed var(--ib-border)",
                    background: "var(--ib-bg-surface-secondary)",
                    cursor: "pointer",
                    borderRadius: "14px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#E42313")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--ib-border)")}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(228, 35, 19, 0.12)",
                      color: "#E42313",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <FaImage size={20} />
                  </div>
                  <span className="font-weight-bold" style={{ fontSize: "0.9rem", color: "var(--ib-text-main)" }}>
                    Click to select an image
                  </span>
                  <small className="text-muted mt-0.5" style={{ fontSize: "0.78rem" }}>
                    Crop, rotate, zoom, and select your custom aspect ratio (16:9, 1:1, 4:3, 4:5)
                  </small>
                </div>
              ) : (
                <div
                  className="p-3 rounded-xl border d-flex flex-column gap-2.5"
                  style={{
                    background: "var(--ib-bg-surface-secondary)",
                    borderColor: "var(--ib-border)",
                    borderRadius: "14px",
                  }}
                >
                  <div
                    className="position-relative rounded-lg overflow-hidden border shadow-sm"
                    style={{
                      maxHeight: "340px",
                      background: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Cropped Preview"
                      style={{
                        width: "100%",
                        maxHeight: "340px",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>

                  {/* Image Adjust Toolbar */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-1">
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 font-weight-bold d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: "0.82rem" }}
                      >
                        <FaCropAlt size={11} />
                        <span>Adjust / Crop Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 font-weight-bold d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: "0.82rem" }}
                      >
                        <FaSyncAlt size={10} />
                        <span>Change Photo</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 font-weight-bold d-inline-flex align-items-center gap-1.5"
                      style={{ fontSize: "0.82rem" }}
                    >
                      <FaTrash size={10} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
              <button
                type="button"
                className="btn btn-ib-secondary rounded-pill px-4 py-2 font-weight-bold"
                onClick={() => navigate("/")}
                style={{ fontSize: "0.85rem" }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="btn-ib-primary rounded-pill px-4 py-2 font-weight-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{ fontSize: "0.9rem" }}
              >
                <FaPaperPlane size={12} />
                <span>{submitting ? "Publishing..." : "Create Post"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {isCropperOpen && rawImageSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={rawImageSrc}
          fileName={rawFileName}
          onCropComplete={handleCropComplete}
          onClose={() => setIsCropperOpen(false)}
        />
      )}
    </div>
  );
}

export default Post;
