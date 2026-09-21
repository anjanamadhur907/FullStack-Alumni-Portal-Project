import { useEffect, useState } from "react";
import axiosInstance from "../axios-config/api";
import Navbar from "../nav/Nav";
import { getProfile } from "../redux-config/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ViewAllPosts from "../post/ViewAllPosts";
import {
  FaPlus,
  FaListUl,
  FaArrowRight,
  FaBullhorn,
  FaShieldAlt,
} from "react-icons/fa";

function Home() {
  const { isLoggedIn, currentUser, profile_data } = useSelector((store) => store.user);
  const dispatch = useDispatch();

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

  useEffect(() => {
    if (currentUser?.token && !isAdmin) {
      loadProfile();
    }
  }, [currentUser, isAdmin]);

  const loadProfile = async () => {
    try {
      const token = currentUser.token;
      const headers = { Authorization: "Bearer " + token };
      const res = await axiosInstance.get("/profile/me", { headers });
      dispatch(getProfile(res.data));
    } catch (err) {
      console.error("Profile loading error:", err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
      <Navbar />

      <main className="container py-3 py-md-4" style={{ maxWidth: "1020px" }}>
        {/* ============================================================ */}
        {/* 1. COMPACT ADMIN BAR (Only for Admin)                       */}
        {/* ============================================================ */}
        {isLoggedIn && isAdmin && (
          <div
            className="ib-card p-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2.5 shadow-sm"
            style={{
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFF",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge px-2.5 py-1 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1"
                style={{ background: "rgba(99, 102, 241, 0.3)", color: "#C7D2FE", fontSize: "0.75rem" }}
              >
                <FaShieldAlt size={10} /> Admin
              </span>
              <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                Admin Console
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link
                to="/post"
                className="btn btn-sm btn-primary px-3 py-1.5 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5 text-white"
                style={{ fontSize: "0.8rem", background: "#4F46E5", borderColor: "#4F46E5" }}
              >
                <FaBullhorn size={11} /> + New Announcement
              </Link>
              <Link
                to="/admin/dashboard"
                className="btn btn-sm btn-outline-light px-3 py-1.5 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: "0.8rem", borderColor: "rgba(255, 255, 255, 0.3)" }}
              >
                <span>Dashboard</span>
                <FaArrowRight size={10} />
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. COMPACT ALUMNI BAR (Only for Alumni)                     */}
        {/* ============================================================ */}
        {isLoggedIn && !isAdmin && isAlumni && (
          <div
            className="ib-card p-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-sm"
            style={{ borderRadius: "14px", border: "1px solid var(--ib-border)" }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="badge-alumni px-2.5 py-1" style={{ fontSize: "0.72rem" }}>
                🎓 Alumni
              </span>
              <span className="font-weight-bold" style={{ fontSize: "0.88rem" }}>
                Welcome, {profile_data?.name || currentUser?.name || "Alumni"}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link
                to="/post"
                className="btn btn-sm btn-primary px-3 py-1.5 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5 text-white shadow-sm"
                style={{ fontSize: "0.8rem", background: "var(--ib-primary, #E42313)", borderColor: "var(--ib-primary, #E42313)" }}
              >
                <FaPlus size={10} /> Create Post
              </Link>
              <Link
                to="/my-posts"
                className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: "0.8rem" }}
              >
                <FaListUl size={11} /> My Posts
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. GUEST BANNER (Only when not logged in)                   */}
        {/* ============================================================ */}
        {!isLoggedIn && (
          <div
            className="ib-card p-4 mb-3.5 text-center position-relative overflow-hidden"
            style={{
              borderRadius: "16px",
              background: "var(--ib-bg-surface)",
              border: "1px solid var(--ib-border)",
            }}
          >
            <h2 className="brand-font mb-1.5 font-weight-bold" style={{ fontSize: "1.45rem" }}>
              InfoBeans Foundation Portal
            </h2>
            <p className="text-muted mx-auto mb-3" style={{ maxWidth: "520px", fontSize: "0.88rem" }}>
              Connect with students and alumni, browse career opportunities and community announcements.
            </p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Link
                to="/signin"
                className="btn btn-sm btn-primary px-3.5 py-2 rounded-pill font-weight-bold text-white"
                style={{ fontSize: "0.84rem", background: "var(--ib-primary, #E42313)", borderColor: "var(--ib-primary, #E42313)" }}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn-sm btn-outline-secondary px-3.5 py-2 rounded-pill font-weight-bold"
                style={{ fontSize: "0.84rem" }}
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. POSTS FEED (DIRECTLY DISPLAYED FOR ALL USERS)            */}
        {/* ============================================================ */}
        <div id="posts-stream-section">
          <ViewAllPosts showTopBanner={false} />
        </div>
      </main>
    </div>
  );
}

export default Home;