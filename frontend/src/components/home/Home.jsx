import { useEffect, useState } from "react";
import axiosInstance from "../axios-config/api";
import Navbar from "../nav/Nav";
import { getProfile } from "../redux-config/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ViewAllPosts from "../post/ViewAllPosts";
import {
  FaShieldAlt,
  FaGraduationCap,
  FaUserGraduate,
  FaPlus,
  FaListUl,
  FaUserEdit,
  FaArrowRight,
  FaBullhorn,
  FaUserPlus,
  FaFolderPlus,
  FaCalendarCheck,
  FaLightbulb,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";

function Home() {
  const { isLoggedIn, currentUser, profile_data } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [adminStats, setAdminStats] = useState({
    totalStudents: 0,
    alumniCount: 0,
    currentStudentCount: 0,
    totalBatches: 0,
  });

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

  const isStudent =
    isLoggedIn &&
    (profile_data?.role === "Student" || currentUser?.role === "Student") &&
    !isAlumni &&
    !isAdmin;

  useEffect(() => {
    if (currentUser?.token && !isAdmin) {
      loadProfile();
    }
    if (isAdmin) {
      loadAdminStats();
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

  const loadAdminStats = async () => {
    try {
      const [batchRes, studentRes] = await Promise.all([
        axiosInstance.get("/batch/"),
        axiosInstance.get("/student/"),
      ]);
      const batches = Array.isArray(batchRes.data) ? batchRes.data : [];
      const students = Array.isArray(studentRes.data) ? studentRes.data : [];
      setAdminStats({
        totalBatches: batches.length,
        totalStudents: students.length,
      });
    } catch (err) {
      console.error("Admin stats fetch error:", err);
    }
  };

  const userName = profile_data?.name || currentUser?.name || (isAdmin ? "Administrator" : "Member");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
      <Navbar />

      <main className="container py-4" style={{ maxWidth: "1020px" }}>
        {/* ============================================================ */}
        {/* 1. ADMIN DASHBOARD HERO (When logged in as Admin)           */}
        {/* ============================================================ */}
        {isLoggedIn && isAdmin && (
          <div
            className="ib-card text-white p-4 p-md-5 mb-4 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)",
              borderRadius: "22px",
              boxShadow: "0 12px 36px rgba(15, 23, 42, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge px-3 py-1 rounded-pill font-weight-bold"
                  style={{
                    background: "rgba(99, 102, 241, 0.35)",
                    color: "#C7D2FE",
                    border: "1px solid rgba(165, 180, 252, 0.3)",
                    fontSize: "0.76rem",
                  }}
                >
                  <FaShieldAlt className="mr-1" size={11} /> Admin Authority Console
                </span>
                <span className="text-white-50" style={{ fontSize: "0.8rem" }}>
                  Official Operations Hub
                </span>
              </div>

              <Link
                to="/admin/dashboard"
                className="btn btn-sm btn-outline-light rounded-pill px-3 py-1.5 font-weight-bold d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: "0.8rem", borderColor: "rgba(255, 255, 255, 0.35)" }}
              >
                <span>Full Analytics Dashboard</span>
                <FaArrowRight size={10} />
              </Link>
            </div>

            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <h1 className="brand-font text-white mb-2 font-weight-bold" style={{ fontSize: "1.85rem" }}>
                  Welcome, System Administrator
                </h1>
                <p className="text-white-50 mb-4" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                  You have full administrative privileges to manage student enrollments, batch schedules, publish official foundation announcements, and moderate community posts.
                </p>

                {/* Admin Quick Action Buttons */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Link
                    to="/post"
                    className="btn px-3.5 py-2 rounded-pill font-weight-bold text-white d-inline-flex align-items-center gap-2 shadow-sm"
                    style={{
                      fontSize: "0.84rem",
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      border: "none",
                    }}
                  >
                    <FaBullhorn size={12} />
                    <span>Publish Announcement</span>
                  </Link>

                  <Link
                    to="/admin/create-student"
                    className="btn btn-light px-3.5 py-2 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5 text-dark"
                    style={{ fontSize: "0.84rem" }}
                  >
                    <FaUserPlus size={12} color="#4F46E5" />
                    <span>+ Add Student</span>
                  </Link>

                  <Link
                    to="/admin/create-batch"
                    className="btn btn-outline-light px-3.5 py-2 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: "0.84rem", borderColor: "rgba(255, 255, 255, 0.4)" }}
                  >
                    <FaFolderPlus size={12} />
                    <span>+ Create Batch</span>
                  </Link>
                </div>
              </div>

              {/* Admin Quick Stats Mini Cards */}
              <div className="col-lg-5">
                <div className="row g-2">
                  <div className="col-6">
                    <div
                      className="p-3 rounded-lg text-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "14px",
                      }}
                    >
                      <FaUsers size={20} color="#818CF8" className="mb-1" />
                      <div className="text-white-50" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>
                        Registered Students
                      </div>
                      <div className="font-weight-bold text-white mt-1" style={{ fontSize: "1.4rem" }}>
                        {adminStats.totalStudents}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className="p-3 rounded-lg text-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "14px",
                      }}
                    >
                      <FaCalendarCheck size={20} color="#34D399" className="mb-1" />
                      <div className="text-white-50" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>
                        Total Batches
                      </div>
                      <div className="font-weight-bold text-white mt-1" style={{ fontSize: "1.4rem" }}>
                        {adminStats.totalBatches}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ALUMNI DASHBOARD HERO (When logged in as Alumni)         */}
        {/* ============================================================ */}
        {isLoggedIn && !isAdmin && isAlumni && (
          <div
            className="ib-card text-white p-4 p-md-5 mb-4 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1E2433 0%, #293042 50%, #191E2B 100%)",
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderLeft: "6px solid #E42313",
            }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-2.5">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge px-3 py-1 rounded-pill font-weight-bold"
                  style={{
                    background: "rgba(228, 35, 19, 0.2)",
                    color: "#FFAAA3",
                    border: "1px solid rgba(228, 35, 19, 0.4)",
                    fontSize: "0.78rem",
                  }}
                >
                  <FaGraduationCap className="mr-1" size={13} /> Verified Alumni Hub
                </span>
                <span className="text-white-50" style={{ fontSize: "0.8rem" }}>
                  InfoBeans Foundation Graduate
                </span>
              </div>

              <span className="d-inline-flex align-items-center gap-1 text-success font-weight-bold" style={{ fontSize: "0.8rem" }}>
                <FaCheckCircle size={12} /> Community Contributor
              </span>
            </div>

            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h1 className="brand-font text-white mb-2 font-weight-bold" style={{ fontSize: "1.85rem" }}>
                  Welcome back, {userName}! 🎓
                </h1>
                <p className="text-white-50 mb-4" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                  As an InfoBeans Foundation Alumni, you can share career opportunities, job referrals, events, and mentor current scholars across all cohorts.
                </p>

                {/* Alumni Action Toolbar */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Link
                    to="/post"
                    className="btn btn-ib-primary px-4 py-2 rounded-pill font-weight-bold d-inline-flex align-items-center gap-2 shadow-sm"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <FaPlus size={11} />
                    <span>Create New Post</span>
                  </Link>

                  <Link
                    to="/my-posts"
                    className="btn btn-outline-light px-3.5 py-2 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: "0.85rem", borderColor: "rgba(255, 255, 255, 0.35)" }}
                  >
                    <FaListUl size={12} />
                    <span>My Published Posts</span>
                  </Link>

                  <Link
                    to="/student-profile"
                    className="btn btn-light px-3.5 py-2 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5 text-dark"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <FaUserEdit size={12} color="#E42313" />
                    <span>Edit Profile</span>
                  </Link>
                </div>
              </div>

              <div className="col-lg-4 text-center d-none d-lg-block">
                <div
                  className="p-3.5 rounded-lg text-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #E42313, #EA1B3D)",
                      color: "#FFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      boxShadow: "0 4px 14px rgba(228, 35, 19, 0.4)",
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-weight-bold text-white" style={{ fontSize: "1rem" }}>
                    {userName}
                  </div>
                  <small className="text-white-50">Alumni Member</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. STUDENT DASHBOARD HERO (When logged in as Student)       */}
        {/* ============================================================ */}
        {isLoggedIn && !isAdmin && isStudent && (
          <div
            className="ib-card p-4 p-md-5 mb-4 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
              borderRadius: "22px",
              boxShadow: "0 8px 24px rgba(2, 132, 199, 0.08)",
              border: "1px solid rgba(2, 132, 199, 0.25)",
              borderLeft: "6px solid #005DA6",
            }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-2.5">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge px-3 py-1 rounded-pill font-weight-bold"
                  style={{
                    background: "rgba(0, 93, 166, 0.12)",
                    color: "#005DA6",
                    border: "1px solid rgba(0, 93, 166, 0.25)",
                    fontSize: "0.78rem",
                  }}
                >
                  <FaUserGraduate className="mr-1" size={12} /> Student Scholar Hub
                </span>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Active Cohort Scholar
                </span>
              </div>

              <span className="badge-student px-3 py-1" style={{ fontSize: "0.75rem" }}>
                🎒 Ongoing Training
              </span>
            </div>

            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h1 className="brand-font mb-2 font-weight-bold" style={{ fontSize: "1.85rem", color: "#005DA6" }}>
                  Welcome, {userName}! 🎒
                </h1>
                <p className="text-secondary mb-4" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                  Stay connected with InfoBeans Foundation updates, browse job referrals and announcements shared by Alumni, and prepare for your graduation into the Alumni network!
                </p>

                {/* Student Action Toolbar */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Link
                    to="/student-profile"
                    className="btn px-4 py-2 rounded-pill font-weight-bold text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
                    style={{ fontSize: "0.85rem", background: "linear-gradient(135deg, #005DA6, #0284C7)", border: "none" }}
                  >
                    <FaUserEdit size={12} />
                    <span>View / Edit Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      const el = document.getElementById("posts-stream-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="btn btn-outline-secondary px-3.5 py-2 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: "0.85rem", borderColor: "rgba(0, 93, 166, 0.3)", color: "#005DA6" }}
                  >
                    <FaLightbulb size={12} />
                    <span>Browse Alumni Feed ↓</span>
                  </button>
                </div>
              </div>

              <div className="col-lg-4 text-center d-none d-lg-block">
                <div
                  className="p-3.5 rounded-lg text-center bg-white shadow-sm"
                  style={{
                    border: "1px solid rgba(2, 132, 199, 0.2)",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #005DA6, #0284C7)",
                      color: "#FFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      boxShadow: "0 4px 14px rgba(0, 93, 166, 0.3)",
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-weight-bold" style={{ fontSize: "1rem", color: "#005DA6" }}>
                    {userName}
                  </div>
                  <small className="text-muted">Student Scholar</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. GUEST / LOGGED-OUT HERO                                  */}
        {/* ============================================================ */}
        {!isLoggedIn && (
          <div
            className="ib-card text-white p-4 p-md-5 mb-4 position-relative overflow-hidden text-center"
            style={{
              background: "linear-gradient(135deg, #1E2433 0%, #2A2F3D 60%, #1E2433 100%)",
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              borderTop: "4px solid #E42313",
            }}
          >
            <div
              style={{
                background: "#FFF9ED",
                padding: "6px 14px",
                borderRadius: "12px",
                display: "inline-block",
                marginBottom: "16px",
              }}
            >
              <img
                src="/infobeans-foundation-logo.png"
                alt="InfoBeans Foundation"
                style={{ height: "42px", width: "auto" }}
              />
            </div>
            <h1 className="brand-font text-white font-weight-bold mb-2" style={{ fontSize: "2rem" }}>
              InfoBeans Foundation Alumni Network
            </h1>
            <p className="text-white-50 mx-auto mb-4" style={{ maxWidth: "620px", fontSize: "0.95rem", lineHeight: 1.6 }}>
              The official portal connecting InfoBeans Foundation students and graduates for career mentorship, job referrals, and community announcements.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/signin" className="btn btn-ib-primary px-4 py-2.5 rounded-pill font-weight-bold" style={{ fontSize: "0.9rem" }}>
                Sign In to Portal
              </Link>
              <Link to="/signup" className="btn btn-outline-light px-4 py-2.5 rounded-pill font-weight-bold" style={{ fontSize: "0.9rem" }}>
                Register with Card ID
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. COMMUNITY POSTS STREAM (Common feed for all roles)        */}
        {/* ============================================================ */}
        <div id="posts-stream-section">
          <ViewAllPosts showTopBanner={false} />
        </div>
      </main>
    </div>
  );
}

export default Home;