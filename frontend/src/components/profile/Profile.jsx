import React, { useEffect, useState } from "react";
import Navbar from "../nav/Nav";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../redux-config/UserSlice";
import axiosInstance from "../axios-config/api";
import { NavLink } from "react-router-dom";
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
  FaShareAlt,
  FaExternalLinkAlt,
  FaBuilding,
  FaIdBadge,
} from "react-icons/fa";

function Profile() {
  const { currentUser, profile_data } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    website_url1: "",
    website_url2: "",
    website_url3: "",
    about: "",
  });

  const isAlumni =
    profile?.role === "Alumni" ||
    profile_data?.role === "Alumni" ||
    currentUser?.role === "Alumni";

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = currentUser?.token;
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await axiosInstance.get("/profile/me", { headers });
      dispatch(getProfile(res.data));
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        dob: res.data.dob || "",
        gender: res.data.gender || "",
        website_url1: res.data.website_url1 || "",
        website_url2: res.data.website_url2 || "",
        website_url3: res.data.website_url3 || "",
        about: res.data.about || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
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
    setForm({
      name: profile.name || "",
      dob: profile.dob || "",
      gender: profile.gender || "",
      website_url1: profile.website_url1 || "",
      website_url2: profile.website_url2 || "",
      website_url3: profile.website_url3 || "",
      about: profile.about || "",
    });
    setEdit(false);
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info("Profile link copied to clipboard!");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
      <Navbar />

      <div className="container py-4" style={{ maxWidth: "880px" }}>
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
            onClick={copyProfileLink}
            className="btn btn-sm btn-ib-secondary d-flex align-items-center gap-1.5 px-3 py-1 rounded-pill"
            style={{ fontSize: "0.78rem" }}
          >
            <FaShareAlt size={11} />
            <span>Share Profile</span>
          </button>
        </div>

        {/* 1. Main Header Card */}
        <div className="ib-card p-4 p-md-4 mb-4" style={{ borderRadius: "18px" }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3.5">
              {/* Profile Avatar */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: isAlumni
                    ? "linear-gradient(135deg, #E42313, #EA1B3D)"
                    : "linear-gradient(135deg, #005DA6, #0284C7)",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 800,
                  boxShadow: isAlumni
                    ? "0 4px 14px rgba(228, 35, 19, 0.3)"
                    : "0 4px 14px rgba(0, 93, 166, 0.3)",
                  flexShrink: 0,
                }}
              >
                {profile.name ? profile.name.charAt(0).toUpperCase() : <FaUser size={30} />}
              </div>

              {/* User Identity Details */}
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h2 className="brand-font mb-0 font-weight-bold" style={{ fontSize: "1.45rem" }}>
                    {profile.name || "Member Profile"}
                  </h2>
                  <span className={isAlumni ? "badge-alumni" : "badge-student"}>
                    {isAlumni ? "🎓 Alumni" : "🎒 Student"}
                  </span>
                  <span
                    className="d-inline-flex align-items-center gap-1 text-success font-weight-bold"
                    style={{ fontSize: "0.76rem" }}
                  >
                    <FaCheckCircle size={12} /> Verified
                  </span>
                </div>

                <div className="text-muted" style={{ fontSize: "0.85rem", lineHeight: 1.4 }}>
                  {isAlumni
                    ? "InfoBeans Foundation Graduate & Community Member"
                    : "InfoBeans Foundation Scholar & Student"}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!edit ? (
              <button
                onClick={() => setEdit(true)}
                className="btn btn-outline-danger btn-sm px-4 py-1.5 rounded-pill font-weight-bold d-flex align-items-center gap-1.5"
                style={{ fontSize: "0.84rem", borderColor: "#E42313", color: "#E42313" }}
              >
                <FaEdit size={12} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  onClick={updateProfile}
                  disabled={saving}
                  className="btn btn-success btn-sm px-3.5 py-1.5 rounded-pill font-weight-bold d-flex align-items-center gap-1"
                  style={{ fontSize: "0.84rem" }}
                >
                  <FaSave size={12} />
                  <span>{saving ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="btn btn-ib-secondary btn-sm px-3 py-1.5 rounded-pill"
                  style={{ fontSize: "0.84rem" }}
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Profile Details & Content */}
        {!edit ? (
          <div className="d-flex flex-column gap-3.5">
            {/* About Card */}
            <div className="ib-card p-4" style={{ borderRadius: "16px" }}>
              <h5 className="brand-font font-weight-bold mb-2.5" style={{ fontSize: "1.05rem" }}>
                About
              </h5>
              <p
                className="text-secondary mb-0"
                style={{ fontSize: "0.92rem", lineHeight: 1.65, whiteSpace: "pre-wrap" }}
              >
                {profile.about || (
                  <span className="text-muted font-italic">
                    No bio added yet. Click 'Edit Profile' to write a brief bio about your interests and journey.
                  </span>
                )}
              </p>
            </div>

            {/* Personal Information Card */}
            <div className="ib-card p-4" style={{ borderRadius: "16px" }}>
              <h5 className="brand-font font-weight-bold mb-3" style={{ fontSize: "1.05rem" }}>
                Personal Information
              </h5>

              <div className="row">
                {/* Email */}
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "var(--ib-bg-surface-secondary)",
                        color: "#E42313",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FaEnvelope size={15} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                        Email Address
                      </div>
                      <div className="font-weight-bold" style={{ fontSize: "0.9rem" }}>
                        {currentUser?.email || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "var(--ib-bg-surface-secondary)",
                        color: "#005DA6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FaBuilding size={15} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                        Organization
                      </div>
                      <div className="font-weight-bold" style={{ fontSize: "0.9rem" }}>
                        InfoBeans Foundation
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "var(--ib-bg-surface-secondary)",
                        color: "#D97706",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FaCalendarAlt size={15} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                        Date of Birth
                      </div>
                      <div className="font-weight-bold" style={{ fontSize: "0.9rem" }}>
                        {profile.dob
                          ? new Date(profile.dob).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "var(--ib-bg-surface-secondary)",
                        color: "#8B5CF6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FaVenusMars size={15} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                        Gender
                      </div>
                      <div className="font-weight-bold" style={{ fontSize: "0.9rem" }}>
                        {profile.gender || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social & Professional Links Card */}
            <div className="ib-card p-4" style={{ borderRadius: "16px" }}>
              <h5 className="brand-font font-weight-bold mb-3" style={{ fontSize: "1.05rem" }}>
                Professional Links
              </h5>

              <div className="d-flex gap-2.5 flex-wrap">
                {profile.website_url1 ? (
                  <a
                    href={profile.website_url1.startsWith("http") ? profile.website_url1 : `https://${profile.website_url1}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-ib-secondary d-flex align-items-center gap-2 px-3.5 py-2 rounded-pill font-weight-bold"
                    style={{ fontSize: "0.84rem", color: "#0A66C2" }}
                  >
                    <FaLinkedin size={16} />
                    <span>LinkedIn</span>
                    <FaExternalLinkAlt size={10} style={{ opacity: 0.6 }} />
                  </a>
                ) : null}

                {profile.website_url2 ? (
                  <a
                    href={profile.website_url2.startsWith("http") ? profile.website_url2 : `https://${profile.website_url2}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-ib-secondary d-flex align-items-center gap-2 px-3.5 py-2 rounded-pill font-weight-bold"
                    style={{ fontSize: "0.84rem" }}
                  >
                    <FaGithub size={16} />
                    <span>GitHub</span>
                    <FaExternalLinkAlt size={10} style={{ opacity: 0.6 }} />
                  </a>
                ) : null}

                {profile.website_url3 ? (
                  <a
                    href={profile.website_url3.startsWith("http") ? profile.website_url3 : `https://${profile.website_url3}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-ib-secondary d-flex align-items-center gap-2 px-3.5 py-2 rounded-pill font-weight-bold"
                    style={{ fontSize: "0.84rem", color: "#005DA6" }}
                  >
                    <FaGlobe size={16} />
                    <span>Portfolio / Website</span>
                    <FaExternalLinkAlt size={10} style={{ opacity: 0.6 }} />
                  </a>
                ) : null}

                {!profile.website_url1 && !profile.website_url2 && !profile.website_url3 && (
                  <span className="text-muted" style={{ fontSize: "0.88rem" }}>
                    No professional links added yet. Click 'Edit Profile' to add LinkedIn, GitHub, or Portfolio.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 3. Edit Profile Form */
          <div className="ib-card p-4 p-md-5" style={{ borderRadius: "18px" }}>
            <h4 className="brand-font font-weight-bold mb-4" style={{ fontSize: "1.25rem" }}>
              Edit Profile Information
            </h4>

            <form onSubmit={updateProfile}>
              <div className="row">
                <div className="col-12 form-group mb-3.5">
                  <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
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
                  <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
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
                  <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
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
                  <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                    LinkedIn URL
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                        <FaLinkedin size={14} color="#0A66C2" />
                      </span>
                    </div>
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
                  <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                    GitHub URL
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                        <FaGithub size={14} />
                      </span>
                    </div>
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
                  <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                    Personal Portfolio / Website URL
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                        <FaGlobe size={14} color="#005DA6" />
                      </span>
                    </div>
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
                  <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                    About / Bio
                  </label>
                  <textarea
                    className="form-control"
                    name="about"
                    rows={4}
                    placeholder="Tell the community about your background, skills, and interests..."
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
      </div>
    </div>
  );
}

export default Profile;