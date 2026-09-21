import React, { useEffect, useState } from "react";
import Navbar from "../nav/Nav";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../redux-config/UserSlice";
import axiosInstance from "../axios-config/api";
import { NavLink, useParams, Link } from "react-router-dom";
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaArrowLeft,
  FaEnvelope,
  FaCalendarAlt,
  FaVenusMars,
  FaGraduationCap,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaBuilding,
  FaLayerGroup,
  FaShieldAlt,
  FaClock,
  FaCopy,
  FaShareAlt,
  FaPhoneAlt,
  FaIdCard,
  FaBookOpen,
  FaTag,
  FaExpandAlt,
} from "react-icons/fa";

function Profile() {
  const { userId } = useParams();
  const { currentUser, profile_data } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    website_url1: "",
    website_url2: "",
    website_url3: "",
    about: "",
  });

  // Determine if viewing own profile or another member's profile
  const isOwnProfile =
    !userId ||
    userId === "undefined" ||
    userId === "null" ||
    (currentUser?.id && String(currentUser.id) === String(userId)) ||
    (profile_data?.user_id && String(profile_data.user_id) === String(userId));

  const isAlumni =
    profile?.role === "Alumni" ||
    (isOwnProfile && (profile_data?.role === "Alumni" || currentUser?.role === "Alumni"));

  const isAdmin =
    profile?.role === "Admin" ||
    (isOwnProfile && (currentUser?.is_admin || currentUser?.role === "Admin" || profile_data?.role === "Admin"));

  useEffect(() => {
    loadProfileData();
    loadUserPosts();
  }, [userId]);

  const loadProfileData = async () => {
    setLoadingProfile(true);
    try {
      const token = currentUser?.token;
      const headers = token ? { Authorization: "Bearer " + token } : {};

      let profileData = null;

      if (isOwnProfile) {
        const res = await axiosInstance.get("/profile/me", { headers });
        profileData = res.data;
        dispatch(getProfile(res.data));
      } else {
        // Try endpoint 1: /profile/user/:userId
        try {
          const res = await axiosInstance.get(`/profile/user/${userId}`, { headers });
          profileData = res.data;
        } catch (err1) {
          // Try endpoint 2: /profile/:userId
          try {
            const res2 = await axiosInstance.get(`/profile/${userId}`, { headers });
            profileData = res2.data;
          } catch (err2) {
            // Fallback: If profile endpoint is unavailable, extract details from user's posts
            try {
              const postsRes = await axiosInstance.get(`/post/user/${userId}`, { headers });
              const postsList = Array.isArray(postsRes.data) ? postsRes.data : [];
              if (postsList.length > 0) {
                const authorPost = postsList[0];
                profileData = {
                  user_id: Number(userId),
                  name: authorPost.user_name || "Community Member",
                  role: authorPost.is_admin ? "Admin" : "Alumni",
                  batch_name: authorPost.user_batch || "InfoBeans Foundation",
                  about: null,
                  dob: null,
                  gender: null,
                  website_url1: null,
                  website_url2: null,
                  website_url3: null,
                };
              } else {
                throw new Error("User not found");
              }
            } catch (err3) {
              console.error("All profile fetch strategies failed:", err3);
              profileData = null;
            }
          }
        }
      }

      if (profileData) {
        setProfile(profileData);
        setForm({
          name: profileData.name || "",
          dob: profileData.dob || "",
          gender: profileData.gender || "",
          website_url1: profileData.website_url1 || "",
          website_url2: profileData.website_url2 || "",
          website_url3: profileData.website_url3 || "",
          about: profileData.about || "",
        });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadUserPosts = async () => {
    setLoadingPosts(true);
    try {
      let endpoint = "/post/me";
      if (!isOwnProfile && userId && userId !== "undefined" && userId !== "null") {
        endpoint = `/post/user/${userId}`;
      }

      const token = currentUser?.token;
      const headers = token ? { Authorization: "Bearer " + token } : {};

      const res = await axiosInstance.get(endpoint, { headers });
      setUserPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading user posts:", err);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const token = currentUser?.token;
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });

      const res = await axiosInstance.put("/profile/me", payload, { headers });
      setProfile(res.data);
      dispatch(getProfile(res.data));
      setForm({
        name: res.data.name || "",
        dob: res.data.dob || "",
        gender: res.data.gender || "",
        website_url1: res.data.website_url1 || "",
        website_url2: res.data.website_url2 || "",
        website_url3: res.data.website_url3 || "",
        about: res.data.about || "",
      });
      setEdit(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setForm({
        name: profile.name || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        website_url1: profile.website_url1 || "",
        website_url2: profile.website_url2 || "",
        website_url3: profile.website_url3 || "",
        about: profile.about || "",
      });
    }
    setEdit(false);
  };

  const formatUrl = (url) => {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const copyToClipboard = (text, label = "Link") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const renderBioWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part && part.match(urlRegex)) {
        const href = formatUrl(part);
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--ib-primary, #E42313)",
              textDecoration: "underline",
              wordBreak: "break-all",
              fontWeight: 600,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const displayName =
    profile?.name || (isOwnProfile ? currentUser?.name || "My Profile" : "Member Profile");

  const hasAnySocialLinks =
    Boolean(profile?.website_url1 || profile?.website_url2 || profile?.website_url3);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--ib-bg)",
        color: "var(--ib-text-main)",
        paddingBottom: "80px",
      }}
    >
      <Navbar />

      <div className="container py-3 py-md-4" style={{ maxWidth: "900px" }}>
        {/* Navigation Bar */}
        <div className="d-flex align-items-center justify-content-between mb-3.5">
          <NavLink
            to="/"
            className="text-muted font-weight-bold d-inline-flex align-items-center gap-1.5 text-decoration-none"
            style={{ fontSize: "0.84rem" }}
          >
            <FaArrowLeft size={11} /> Back to Feed
          </NavLink>

          <button
            onClick={() => copyToClipboard(window.location.href, "Profile URL")}
            className="btn btn-sm btn-ib-secondary rounded-pill px-3 py-1 font-weight-bold d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: "0.78rem" }}
            title="Share profile link"
          >
            <FaShareAlt size={10} />
            <span>Share</span>
          </button>
        </div>

        {loadingProfile ? (
          <div className="ib-card p-5 text-center my-4" style={{ borderRadius: "18px" }}>
            <div
              className="spinner-border text-danger mb-3"
              role="status"
              style={{ width: "2.5rem", height: "2.5rem" }}
            />
            <div className="text-muted font-weight-bold" style={{ fontSize: "0.95rem" }}>
              Loading profile details...
            </div>
          </div>
        ) : profile ? (
          <>
            {/* 1. Main Profile Banner Header Card */}
            <div
              className="ib-card p-4 p-md-4 mb-4"
              style={{
                borderRadius: "20px",
                border: "1px solid var(--ib-border)",
                background: "var(--ib-bg-surface)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              <div className="d-flex align-items-start align-items-sm-center justify-content-between flex-column flex-sm-row gap-3">
                <div className="d-flex align-items-center gap-3.5">
                  {/* Profile Avatar */}
                  <div
                    style={{
                      width: "84px",
                      height: "84px",
                      borderRadius: "50%",
                      background: isAdmin
                        ? "linear-gradient(135deg, #4F46E5, #06B6D4)"
                        : isAlumni
                        ? "linear-gradient(135deg, #E42313, #EA1B3D)"
                        : "linear-gradient(135deg, #005DA6, #0284C7)",
                      color: "#FFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                      fontWeight: 800,
                      boxShadow: isAdmin
                        ? "0 6px 18px rgba(79, 70, 229, 0.35)"
                        : isAlumni
                        ? "0 6px 18px rgba(228, 35, 19, 0.3)"
                        : "0 6px 18px rgba(0, 93, 166, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    {isAdmin ? (
                      <FaShieldAlt size={34} />
                    ) : displayName ? (
                      displayName.charAt(0).toUpperCase()
                    ) : (
                      <FaUser size={30} />
                    )}
                  </div>

                  {/* User Identity Details */}
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <h2
                        className="brand-font mb-0 font-weight-bold"
                        style={{ fontSize: "1.5rem", color: "var(--ib-text-main)" }}
                      >
                        {displayName}
                      </h2>
                      <span
                        className={
                          isAdmin
                            ? "badge bg-primary px-2.5 py-1 rounded-pill text-white font-weight-bold"
                            : isAlumni
                            ? "badge-alumni"
                            : "badge-student"
                        }
                        style={{ fontSize: "0.72rem" }}
                      >
                        {isAdmin ? "🛡️ Admin" : isAlumni ? "🎓 Alumni" : "🎒 Student"}
                      </span>
                      <span
                        className="d-inline-flex align-items-center gap-1 text-success font-weight-bold"
                        style={{ fontSize: "0.76rem" }}
                      >
                        <FaCheckCircle size={12} /> Verified
                      </span>
                    </div>

                    <div
                      className="text-muted mb-2"
                      style={{ fontSize: "0.86rem", lineHeight: 1.4 }}
                    >
                      {isAdmin
                        ? "InfoBeans Foundation System Administrator"
                        : isAlumni
                        ? `InfoBeans Foundation Graduate ${
                            profile.batch_name ? `• ${profile.batch_name}` : ""
                          }`
                        : `InfoBeans Foundation Scholar ${
                            profile.batch_name ? `• ${profile.batch_name}` : ""
                          }`}
                    </div>

                    {/* Quick Badges Pill Stream */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span
                        className="badge bg-light text-dark border px-2.5 py-1 rounded-pill font-weight-bold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        📝 {userPosts.length} {userPosts.length === 1 ? "Post" : "Posts"}
                      </span>
                      {profile.gender && (
                        <span
                          className="badge bg-light text-muted border px-2.5 py-1 rounded-pill"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <FaVenusMars size={10} className="me-1" />
                          {profile.gender}
                        </span>
                      )}
                      {profile.batch_name && (
                        <span
                          className="badge bg-light text-muted border px-2.5 py-1 rounded-pill"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <FaGraduationCap size={10} className="me-1" />
                          {profile.batch_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Action Button (Only visible if viewing own profile) */}
                {isOwnProfile && (
                  <div className="w-100 w-sm-auto mt-2 mt-sm-0">
                    {!edit ? (
                      <button
                        onClick={() => setEdit(true)}
                        className="btn btn-outline-danger btn-sm px-4 py-2 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-1.5 w-100 w-sm-auto shadow-sm"
                        style={{ fontSize: "0.84rem" }}
                      >
                        <FaEdit size={12} />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button
                          onClick={updateProfile}
                          disabled={saving}
                          className="btn btn-success btn-sm px-3.5 py-2 rounded-pill font-weight-bold d-flex align-items-center gap-1 shadow-sm"
                          style={{ fontSize: "0.84rem" }}
                        >
                          <FaSave size={12} />
                          <span>{saving ? "Saving..." : "Save"}</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="btn btn-ib-secondary btn-sm px-3 py-2 rounded-pill"
                          style={{ fontSize: "0.84rem" }}
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Profile Details (When Not in Edit Mode) */}
            {!edit ? (
              <div className="d-flex flex-column gap-3.5">
                {/* About / Bio Card */}
                <div
                  className="ib-card p-4"
                  style={{
                    borderRadius: "18px",
                    border: "1px solid var(--ib-border)",
                    background: "var(--ib-bg-surface)",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2.5">
                    <h5
                      className="brand-font font-weight-bold mb-0 d-inline-flex align-items-center gap-2"
                      style={{ fontSize: "1.05rem", color: "var(--ib-text-main)" }}
                    >
                      <FaBookOpen size={14} color="var(--ib-primary, #E42313)" />
                      <span>About / Bio</span>
                    </h5>
                  </div>
                  <div
                    className="text-secondary mb-0"
                    style={{
                      fontSize: "0.93rem",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {profile.about ? (
                      renderBioWithLinks(profile.about)
                    ) : (
                      <span className="text-muted font-italic" style={{ fontSize: "0.88rem" }}>
                        {isOwnProfile
                          ? "No bio added yet. Click 'Edit Profile' to write a brief bio about your skills, interests, and journey."
                          : "No bio added by this member yet."}
                      </span>
                    )}
                  </div>
                </div>

                {/* Social & Professional Links Card */}
                <div
                  className="ib-card p-4"
                  style={{
                    borderRadius: "18px",
                    border: "1px solid var(--ib-border)",
                    background: "var(--ib-bg-surface)",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5
                      className="brand-font font-weight-bold mb-0 d-inline-flex align-items-center gap-2"
                      style={{ fontSize: "1.05rem", color: "var(--ib-text-main)" }}
                    >
                      <FaGlobe size={14} color="#005DA6" />
                      <span>Professional & Social Links</span>
                    </h5>
                    {hasAnySocialLinks && (
                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                        Click to visit profile
                      </span>
                    )}
                  </div>

                  {hasAnySocialLinks ? (
                    <div className="d-flex flex-column gap-2.5">
                      {/* LinkedIn Link Card */}
                      {profile.website_url1 && (
                        <div
                          className="d-flex align-items-center justify-content-between p-3 rounded-3 flex-wrap gap-2"
                          style={{
                            background: "rgba(10, 102, 194, 0.07)",
                            border: "1px solid rgba(10, 102, 194, 0.22)",
                            borderRadius: "12px",
                          }}
                        >
                          <div className="d-flex align-items-center gap-3 overflow-hidden">
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                background: "#0A66C2",
                                color: "#FFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <FaLinkedin size={18} />
                            </div>
                            <div className="overflow-hidden">
                              <div
                                className="font-weight-bold"
                                style={{ fontSize: "0.88rem", color: "#0A66C2" }}
                              >
                                LinkedIn Profile
                              </div>
                              <a
                                href={formatUrl(profile.website_url1)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-truncate d-block text-muted text-decoration-none"
                                style={{ fontSize: "0.78rem", maxWidth: "420px" }}
                              >
                                {profile.website_url1}
                              </a>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2 ms-auto">
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  formatUrl(profile.website_url1),
                                  "LinkedIn Link"
                                )
                              }
                              className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 text-muted"
                              style={{ fontSize: "0.75rem" }}
                              title="Copy link"
                            >
                              <FaCopy size={10} />
                              <span className="d-none d-sm-inline">Copy</span>
                            </button>
                            <a
                              href={formatUrl(profile.website_url1)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm px-3.5 py-1.5 rounded-pill font-weight-bold text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
                              style={{
                                fontSize: "0.82rem",
                                background: "#0A66C2",
                                border: "none",
                              }}
                            >
                              <span>Open LinkedIn</span>
                              <FaExternalLinkAlt size={10} />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* GitHub Link Card */}
                      {profile.website_url2 && (
                        <div
                          className="d-flex align-items-center justify-content-between p-3 rounded-3 flex-wrap gap-2"
                          style={{
                            background: "rgba(36, 41, 47, 0.06)",
                            border: "1px solid rgba(36, 41, 47, 0.2)",
                            borderRadius: "12px",
                          }}
                        >
                          <div className="d-flex align-items-center gap-3 overflow-hidden">
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                background: "#24292F",
                                color: "#FFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <FaGithub size={18} />
                            </div>
                            <div className="overflow-hidden">
                              <div
                                className="font-weight-bold"
                                style={{ fontSize: "0.88rem", color: "var(--ib-text-main)" }}
                              >
                                GitHub Profile
                              </div>
                              <a
                                href={formatUrl(profile.website_url2)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-truncate d-block text-muted text-decoration-none"
                                style={{ fontSize: "0.78rem", maxWidth: "420px" }}
                              >
                                {profile.website_url2}
                              </a>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2 ms-auto">
                            <button
                              onClick={() =>
                                copyToClipboard(formatUrl(profile.website_url2), "GitHub Link")
                              }
                              className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 text-muted"
                              style={{ fontSize: "0.75rem" }}
                              title="Copy link"
                            >
                              <FaCopy size={10} />
                              <span className="d-none d-sm-inline">Copy</span>
                            </button>
                            <a
                              href={formatUrl(profile.website_url2)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm px-3.5 py-1.5 rounded-pill font-weight-bold text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
                              style={{
                                fontSize: "0.82rem",
                                background: "#24292F",
                                border: "none",
                              }}
                            >
                              <span>Open GitHub</span>
                              <FaExternalLinkAlt size={10} />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Portfolio / Personal Website Link Card */}
                      {profile.website_url3 && (
                        <div
                          className="d-flex align-items-center justify-content-between p-3 rounded-3 flex-wrap gap-2"
                          style={{
                            background: "rgba(0, 93, 166, 0.07)",
                            border: "1px solid rgba(0, 93, 166, 0.22)",
                            borderRadius: "12px",
                          }}
                        >
                          <div className="d-flex align-items-center gap-3 overflow-hidden">
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                background: "#005DA6",
                                color: "#FFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <FaGlobe size={18} />
                            </div>
                            <div className="overflow-hidden">
                              <div
                                className="font-weight-bold"
                                style={{ fontSize: "0.88rem", color: "#005DA6" }}
                              >
                                Portfolio / Personal Website
                              </div>
                              <a
                                href={formatUrl(profile.website_url3)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-truncate d-block text-muted text-decoration-none"
                                style={{ fontSize: "0.78rem", maxWidth: "420px" }}
                              >
                                {profile.website_url3}
                              </a>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2 ms-auto">
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  formatUrl(profile.website_url3),
                                  "Portfolio Link"
                                )
                              }
                              className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 text-muted"
                              style={{ fontSize: "0.75rem" }}
                              title="Copy link"
                            >
                              <FaCopy size={10} />
                              <span className="d-none d-sm-inline">Copy</span>
                            </button>
                            <a
                              href={formatUrl(profile.website_url3)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm px-3.5 py-1.5 rounded-pill font-weight-bold text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
                              style={{
                                fontSize: "0.82rem",
                                background: "#005DA6",
                                border: "none",
                              }}
                            >
                              <span>Visit Website</span>
                              <FaExternalLinkAlt size={10} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="p-3.5 rounded-3 text-center text-muted"
                      style={{
                        background: "var(--ib-bg-surface-secondary)",
                        border: "1px dashed var(--ib-border)",
                        borderRadius: "12px",
                      }}
                    >
                      <p className="mb-0" style={{ fontSize: "0.86rem" }}>
                        {isOwnProfile
                          ? "No social or professional links added yet. Click 'Edit Profile' to connect your LinkedIn, GitHub, or Portfolio."
                          : "No professional links added by this member yet."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Personal & Academic Details Card */}
                <div
                  className="ib-card p-4"
                  style={{
                    borderRadius: "18px",
                    border: "1px solid var(--ib-border)",
                    background: "var(--ib-bg-surface)",
                  }}
                >
                  <h5
                    className="brand-font font-weight-bold mb-3 d-inline-flex align-items-center gap-2"
                    style={{ fontSize: "1.05rem", color: "var(--ib-text-main)" }}
                  >
                    <FaIdCard size={14} color="var(--ib-primary, #E42313)" />
                    <span>Member Information</span>
                  </h5>

                  <div className="row g-3">
                    {profile.batch_name && (
                      <div className="col-12 col-sm-6">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "var(--ib-bg-surface-secondary)",
                            border: "1px solid var(--ib-border)",
                          }}
                        >
                          <small
                            className="text-muted font-weight-bold d-block mb-1"
                            style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                          >
                            <FaGraduationCap size={11} className="me-1 text-danger" /> Batch / Cohort
                          </small>
                          <div
                            className="font-weight-bold"
                            style={{ fontSize: "0.9rem", color: "var(--ib-text-main)" }}
                          >
                            {profile.batch_name}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.email && (
                      <div className="col-12 col-sm-6">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "var(--ib-bg-surface-secondary)",
                            border: "1px solid var(--ib-border)",
                          }}
                        >
                          <small
                            className="text-muted font-weight-bold d-block mb-1"
                            style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                          >
                            <FaEnvelope size={11} className="me-1 text-primary" /> Email
                          </small>
                          <a
                            href={`mailto:${profile.email}`}
                            className="font-weight-bold text-decoration-none text-truncate d-block"
                            style={{ fontSize: "0.9rem", color: "var(--ib-text-main)" }}
                          >
                            {profile.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {profile.dob && (
                      <div className="col-12 col-sm-6">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "var(--ib-bg-surface-secondary)",
                            border: "1px solid var(--ib-border)",
                          }}
                        >
                          <small
                            className="text-muted font-weight-bold d-block mb-1"
                            style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                          >
                            <FaCalendarAlt size={11} className="me-1 text-warning" /> Date of Birth
                          </small>
                          <div
                            className="font-weight-bold"
                            style={{ fontSize: "0.9rem", color: "var(--ib-text-main)" }}
                          >
                            {new Date(profile.dob).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.gender && (
                      <div className="col-12 col-sm-6">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "var(--ib-bg-surface-secondary)",
                            border: "1px solid var(--ib-border)",
                          }}
                        >
                          <small
                            className="text-muted font-weight-bold d-block mb-1"
                            style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                          >
                            <FaVenusMars size={11} className="me-1 text-info" /> Gender
                          </small>
                          <div
                            className="font-weight-bold"
                            style={{ fontSize: "0.9rem", color: "var(--ib-text-main)" }}
                          >
                            {profile.gender}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.mobile && (
                      <div className="col-12 col-sm-6">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "var(--ib-bg-surface-secondary)",
                            border: "1px solid var(--ib-border)",
                          }}
                        >
                          <small
                            className="text-muted font-weight-bold d-block mb-1"
                            style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                          >
                            <FaPhoneAlt size={11} className="me-1 text-success" /> Contact
                          </small>
                          <a
                            href={`tel:${profile.mobile}`}
                            className="font-weight-bold text-decoration-none"
                            style={{ fontSize: "0.9rem", color: "var(--ib-text-main)" }}
                          >
                            {profile.mobile}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Published Posts Section by this Member */}
                <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                    <h5
                      className="brand-font font-weight-bold mb-0 d-inline-flex align-items-center gap-2"
                      style={{ fontSize: "1.1rem", color: "var(--ib-text-main)" }}
                    >
                      <FaLayerGroup size={15} color="var(--ib-primary, #E42313)" />
                      <span>{isOwnProfile ? "My Published Posts" : `Posts by ${displayName}`}</span>
                    </h5>
                    <span
                      className="badge bg-light text-dark border px-2.5 py-1 rounded-pill font-weight-bold"
                      style={{ fontSize: "0.78rem" }}
                    >
                      {userPosts.length} {userPosts.length === 1 ? "Post" : "Posts"}
                    </span>
                  </div>

                  {loadingPosts ? (
                    <div className="ib-card p-4 text-center" style={{ borderRadius: "16px" }}>
                      <div className="spinner-border spinner-border-sm text-danger me-2" role="status" />
                      <span className="text-muted font-weight-bold" style={{ fontSize: "0.88rem" }}>
                        Loading posts...
                      </span>
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div
                      className="ib-card p-4 p-sm-5 text-center text-muted"
                      style={{ borderRadius: "18px" }}
                    >
                      <FaLayerGroup size={24} className="mb-2 opacity-50" />
                      <p className="mb-0 font-weight-bold" style={{ fontSize: "0.9rem" }}>
                        {isOwnProfile
                          ? "You have not published any posts yet."
                          : "No posts published by this member yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {userPosts.map((post) => {
                        const imageUrl = post?.image
                          ? post.image.startsWith("http")
                            ? post.image
                            : `${import.meta.env.VITE_API_URL}${post.image}`
                          : "";

                        return (
                          <article
                            key={post.id}
                            className="ib-card p-3.5 p-sm-4"
                            onClick={() => setSelectedPost(post)}
                            style={{
                              borderRadius: "16px",
                              border: "1px solid var(--ib-border)",
                              background: "var(--ib-bg-surface)",
                              cursor: "pointer",
                              transition: "transform 0.15s ease, box-shadow 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span
                                className="badge rounded-pill px-2.5 py-1 font-weight-bold"
                                style={{
                                  fontSize: "0.72rem",
                                  background: "rgba(228, 35, 19, 0.1)",
                                  color: "var(--ib-primary, #E42313)",
                                  border: "1px solid rgba(228, 35, 19, 0.2)",
                                }}
                              >
                                <FaTag size={9} className="me-1" />
                                {post.category || "General"}
                              </span>
                              <small
                                className="text-muted d-flex align-items-center gap-1"
                                style={{ fontSize: "0.75rem" }}
                              >
                                <FaClock size={10} />
                                {post.updated_at || post.created_at
                                  ? new Date(post.updated_at || post.created_at).toLocaleDateString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )
                                  : "Recently"}
                              </small>
                            </div>

                            <h5
                              className="brand-font mb-2 font-weight-bold text-break-all"
                              style={{ fontSize: "1.08rem", color: "var(--ib-text-main)" }}
                            >
                              {post.title}
                            </h5>

                            {post.content && (
                              <p
                                className="text-secondary mb-3 text-break-all"
                                style={{
                                  fontSize: "0.9rem",
                                  lineHeight: 1.6,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {post.content}
                              </p>
                            )}

                            {imageUrl && (
                              <div
                                className="mb-2 rounded-lg overflow-hidden"
                                style={{
                                  maxHeight: "320px",
                                  background: "var(--ib-bg-surface-secondary)",
                                  borderRadius: "12px",
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={post.title}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    maxHeight: "320px",
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                />
                              </div>
                            )}

                            <div
                              className="pt-2 border-top d-flex align-items-center justify-content-between mt-2"
                              style={{ fontSize: "0.78rem" }}
                            >
                              <span className="text-muted d-inline-flex align-items-center gap-1">
                                <FaExpandAlt size={10} /> Click to expand post
                              </span>
                              <span
                                className="font-weight-bold"
                                style={{ color: "var(--ib-primary, #E42313)" }}
                              >
                                Read More →
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 4. Edit Profile Form (Only for Own Profile) */
              <div
                className="ib-card p-4 p-md-5"
                style={{
                  borderRadius: "20px",
                  border: "1px solid var(--ib-border)",
                  background: "var(--ib-bg-surface)",
                }}
              >
                <h4
                  className="brand-font font-weight-bold mb-4"
                  style={{ fontSize: "1.25rem", color: "var(--ib-text-main)" }}
                >
                  Edit Profile Information
                </h4>

                <form onSubmit={updateProfile}>
                  <div className="row">
                    <div className="col-12 form-group mb-3.5">
                      <label
                        className="text-muted font-weight-bold mb-1"
                        style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                      >
                        Full Name *
                      </label>
                      <input
                        className="form-control"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name || ""}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                      />
                    </div>

                    <div className="col-md-6 form-group mb-3.5">
                      <label
                        className="text-muted font-weight-bold mb-1"
                        style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                      >
                        Date of Birth
                      </label>
                      <input
                        className="form-control"
                        type="date"
                        name="dob"
                        value={form.dob ? form.dob.split("T")[0] : ""}
                        onChange={handleChange}
                        style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                      />
                    </div>

                    <div className="col-md-6 form-group mb-3.5">
                      <label
                        className="text-muted font-weight-bold mb-1"
                        style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                      >
                        Gender
                      </label>
                      <select
                        className="form-control"
                        name="gender"
                        value={form.gender || ""}
                        onChange={handleChange}
                        style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6 form-group mb-3.5">
                      <label
                        className="text-muted font-weight-bold mb-1"
                        style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                      >
                        LinkedIn Profile URL
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text border-right-0"
                          style={{ borderRadius: "10px 0 0 10px", background: "rgba(10, 102, 194, 0.1)" }}
                        >
                          <FaLinkedin size={15} color="#0A66C2" />
                        </span>
                        <input
                          className="form-control border-left-0"
                          name="website_url1"
                          placeholder="https://linkedin.com/in/username"
                          value={form.website_url1 || ""}
                          onChange={handleChange}
                          style={{ borderRadius: "0 10px 10px 0", fontSize: "0.88rem" }}
                        />
                      </div>
                    </div>

                    <div className="col-md-6 form-group mb-3.5">
                      <label
                        className="text-muted font-weight-bold mb-1"
                        style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                      >
                        GitHub Profile URL
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text border-right-0"
                          style={{ borderRadius: "10px 0 0 10px", background: "rgba(36, 41, 47, 0.1)" }}
                        >
                          <FaGithub size={15} />
                        </span>
                        <input
                          className="form-control border-left-0"
                          name="website_url2"
                          placeholder="https://github.com/username"
                          value={form.website_url2 || ""}
                          onChange={handleChange}
                          style={{ borderRadius: "0 10px 10px 0", fontSize: "0.88rem" }}
                        />
                      </div>
                    </div>

                    <div className="col-12 form-group mb-3.5">
                      <label
                        className="text-muted font-weight-bold mb-1"
                        style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                      >
                        Personal Portfolio / Website URL
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text border-right-0"
                          style={{ borderRadius: "10px 0 0 10px", background: "rgba(0, 93, 166, 0.1)" }}
                        >
                          <FaGlobe size={15} color="#005DA6" />
                        </span>
                        <input
                          className="form-control border-left-0"
                          name="website_url3"
                          placeholder="https://yourwebsite.com"
                          value={form.website_url3 || ""}
                          onChange={handleChange}
                          style={{ borderRadius: "0 10px 10px 0", fontSize: "0.88rem" }}
                        />
                      </div>
                    </div>

                    <div className="col-12 form-group mb-4">
                      <label
                        className="text-muted font-weight-bold mb-1"
                        style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                      >
                        About / Bio (Introduce yourself & add links)
                      </label>
                      <textarea
                        className="form-control"
                        name="about"
                        rows={4}
                        placeholder="Tell the community about your background, projects, skills, and career journey..."
                        value={form.about || ""}
                        onChange={handleChange}
                        style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="btn btn-ib-secondary px-4 py-2 rounded-pill"
                      style={{ fontSize: "0.88rem" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-success px-4 py-2 rounded-pill font-weight-bold d-flex align-items-center gap-1.5 shadow-sm"
                      style={{ fontSize: "0.88rem" }}
                    >
                      <FaSave size={13} />
                      <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="ib-card p-5 text-center my-4" style={{ borderRadius: "18px" }}>
            <h4 className="font-weight-bold mb-2">Member Profile Not Found</h4>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              The requested profile could not be found or has not set up public details yet.
            </p>
            <Link to="/" className="btn btn-danger rounded-pill px-4 py-2 font-weight-bold">
              Back to Community Feed
            </Link>
          </div>
        )}
      </div>

      {/* Selected Post Full Modal Reader */}
      {selectedPost && (
        <div
          className="modal fade show d-flex align-items-center justify-content-center p-2 p-sm-3"
          tabIndex="-1"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(10, 15, 29, 0.78)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 1060,
            overflowY: "auto",
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="modal-content border-0 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "720px",
              width: "100%",
              maxHeight: "90vh",
              borderRadius: "20px",
              background: "var(--ib-bg-surface)",
              color: "var(--ib-text-main)",
              border: "1px solid var(--ib-border)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between"
              style={{ background: "var(--ib-bg-surface)", borderColor: "var(--ib-border)" }}
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge rounded-pill px-2.5 py-1 font-weight-bold"
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(228, 35, 19, 0.1)",
                    color: "var(--ib-primary, #E42313)",
                  }}
                >
                  <FaTag size={9} className="me-1" />
                  {selectedPost.category || "General"}
                </span>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {selectedPost.updated_at || selectedPost.created_at
                    ? new Date(selectedPost.updated_at || selectedPost.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" }
                      )
                    : "Recently"}
                </small>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center text-muted"
                onClick={() => setSelectedPost(null)}
                style={{ width: "32px", height: "32px", padding: 0 }}
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4" style={{ overflowY: "auto" }}>
              <h3
                className="brand-font font-weight-bold mb-3 text-break-all"
                style={{ fontSize: "1.3rem", color: "var(--ib-text-main)" }}
              >
                {selectedPost.title}
              </h3>

              {selectedPost.content && (
                <div
                  className="mb-3 text-secondary"
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {renderBioWithLinks(selectedPost.content)}
                </div>
              )}

              {selectedPost.image && (
                <div
                  className="rounded-3 overflow-hidden my-3"
                  style={{
                    background: "var(--ib-bg-surface-secondary)",
                    borderRadius: "14px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={
                      selectedPost.image.startsWith("http")
                        ? selectedPost.image
                        : `${import.meta.env.VITE_API_URL}${selectedPost.image}`
                    }
                    alt={selectedPost.title}
                    style={{ width: "100%", maxHeight: "420px", objectFit: "contain", display: "block" }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="px-4 py-3 border-top d-flex justify-content-end"
              style={{ background: "var(--ib-bg-surface-secondary)", borderColor: "var(--ib-border)" }}
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="btn btn-sm btn-secondary rounded-pill px-4 py-1.5 font-weight-bold"
                style={{ fontSize: "0.82rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;