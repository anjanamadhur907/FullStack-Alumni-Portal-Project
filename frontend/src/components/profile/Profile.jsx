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

  const displayName = profile?.name || (isOwnProfile ? (currentUser?.name || "My Profile") : "Member Profile");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)", paddingBottom: "70px" }}>
      <Navbar />

      <div className="container py-3 py-md-4" style={{ maxWidth: "880px" }}>
        {/* Navigation Bar */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <NavLink
            to="/"
            className="text-muted font-weight-bold d-inline-flex align-items-center gap-1.5 text-decoration-none"
            style={{ fontSize: "0.84rem" }}
          >
            <FaArrowLeft size={11} /> Back to Feed
          </NavLink>
        </div>

        {loadingProfile ? (
          <div className="ib-card p-5 text-center my-4">
            <div className="spinner-border text-danger mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }} />
            <div className="text-muted font-weight-bold">Loading profile details...</div>
          </div>
        ) : profile ? (
          <>
            {/* 1. Main Profile Card (Instagram/LinkedIn Style) */}
            <div
              className="ib-card p-4 p-md-4 mb-4"
              style={{
                borderRadius: "18px",
                border: "1px solid var(--ib-border)",
                background: "var(--ib-bg-surface)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3.5">
                  {/* Profile Avatar */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
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
                        ? "0 4px 14px rgba(79, 70, 229, 0.35)"
                        : isAlumni
                        ? "0 4px 14px rgba(228, 35, 19, 0.3)"
                        : "0 4px 14px rgba(0, 93, 166, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    {isAdmin ? (
                      <FaShieldAlt size={32} />
                    ) : displayName ? (
                      displayName.charAt(0).toUpperCase()
                    ) : (
                      <FaUser size={30} />
                    )}
                  </div>

                  {/* User Identity Details */}
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <h2 className="brand-font mb-0 font-weight-bold" style={{ fontSize: "1.45rem" }}>
                        {displayName}
                      </h2>
                      <span className={isAdmin ? "badge bg-primary px-2.5 py-1 rounded-pill text-white" : isAlumni ? "badge-alumni" : "badge-student"}>
                        {isAdmin ? "🛡️ Admin" : isAlumni ? "🎓 Alumni" : "🎒 Student"}
                      </span>
                      <span
                        className="d-inline-flex align-items-center gap-1 text-success font-weight-bold"
                        style={{ fontSize: "0.76rem" }}
                      >
                        <FaCheckCircle size={12} /> Verified
                      </span>
                    </div>

                    <div className="text-muted mb-1" style={{ fontSize: "0.85rem", lineHeight: 1.4 }}>
                      {isAdmin
                        ? "InfoBeans Foundation System Administrator"
                        : isAlumni
                        ? `InfoBeans Foundation Graduate ${profile.batch_name ? `• ${profile.batch_name}` : ""}`
                        : `InfoBeans Foundation Scholar ${profile.batch_name ? `• ${profile.batch_name}` : ""}`}
                    </div>

                    {/* Stats Pill */}
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill font-weight-bold" style={{ fontSize: "0.75rem" }}>
                        📝 {userPosts.length} {userPosts.length === 1 ? "Post" : "Posts"}
                      </span>
                      {profile.gender && (
                        <span className="badge bg-light text-muted border px-2.5 py-1 rounded-pill" style={{ fontSize: "0.75rem" }}>
                          {profile.gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Action Button (Only visible if viewing own profile) */}
                {isOwnProfile && (
                  <div>
                    {!edit ? (
                      <button
                        onClick={() => setEdit(true)}
                        className="btn btn-outline-danger btn-sm px-4 py-1.5 rounded-pill font-weight-bold d-flex align-items-center gap-1.5"
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
                )}
              </div>
            </div>

            {/* 2. Profile Details (When Not in Edit Mode) */}
            {!edit ? (
              <div className="d-flex flex-column gap-3.5">
                {/* About Bio Card */}
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
                        {isOwnProfile
                          ? "No bio added yet. Click 'Edit Profile' to write a brief bio about your interests and journey."
                          : "No bio added by this member yet."}
                      </span>
                    )}
                  </p>
                </div>

                {/* Social & Professional Links Card */}
                {(profile.website_url1 || profile.website_url2 || profile.website_url3 || isOwnProfile) && (
                  <div className="ib-card p-4" style={{ borderRadius: "16px" }}>
                    <h5 className="brand-font font-weight-bold mb-3" style={{ fontSize: "1.05rem" }}>
                      Professional Links & Socials
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
                          No professional links added yet.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Published Posts Section by this Member */}
                <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                    <h5 className="brand-font font-weight-bold mb-0" style={{ fontSize: "1.1rem" }}>
                      {isOwnProfile ? "My Published Posts" : `Posts by ${displayName}`}
                    </h5>
                    <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                      {userPosts.length} {userPosts.length === 1 ? "Post" : "Posts"}
                    </span>
                  </div>

                  {loadingPosts ? (
                    <div className="ib-card p-4 text-center">
                      <div className="spinner-border spinner-border-sm text-danger me-2" role="status" />
                      Loading posts...
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="ib-card p-4 text-center text-muted" style={{ borderRadius: "16px" }}>
                      <FaLayerGroup size={22} className="mb-2 opacity-50" />
                      <p className="mb-0" style={{ fontSize: "0.88rem" }}>
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
                          <div
                            key={post.id}
                            className="ib-card p-4"
                            style={{
                              borderRadius: "16px",
                              border: "1px solid var(--ib-border)",
                              background: "var(--ib-bg-surface)",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="badge-category badge-category-general" style={{ fontSize: "0.7rem" }}>
                                {post.category || "General"}
                              </span>
                              <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                                <FaClock size={10} />
                                {post.updated_at
                                  ? new Date(post.updated_at).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Recently"}
                              </small>
                            </div>

                            <h5 className="brand-font mb-2 font-weight-bold" style={{ fontSize: "1.05rem" }}>
                              {post.title}
                            </h5>

                            {post.content && (
                              <p className="text-secondary mb-3" style={{ fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                {post.content}
                              </p>
                            )}

                            {imageUrl && (
                              <div
                                className="mb-2 rounded-lg overflow-hidden"
                                style={{ maxHeight: "320px", background: "var(--ib-bg-surface-secondary)", borderRadius: "12px" }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={post.title}
                                  style={{ width: "100%", height: "auto", maxHeight: "320px", objectFit: "cover", display: "block" }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 4. Edit Profile Form (Only for Own Profile) */
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
                        <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                          <FaLinkedin size={14} color="#0A66C2" />
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
                      <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                        GitHub URL
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                          <FaGithub size={14} />
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
                      <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Personal Portfolio / Website URL
                      </label>
                      <div className="input-group">
                        <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                          <FaGlobe size={14} color="#005DA6" />
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
          </>
        ) : (
          <div className="ib-card p-5 text-center my-4">
            <h4 className="font-weight-bold">User Not Found</h4>
            <p className="text-muted">The requested profile could not be found or has been removed.</p>
            <Link to="/" className="btn btn-primary rounded-pill px-4 py-2">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;