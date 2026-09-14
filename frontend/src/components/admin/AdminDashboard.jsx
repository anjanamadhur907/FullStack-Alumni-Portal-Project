import { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import { Link } from "react-router-dom";
import axiosInstance from "../axios-config/api";
import {
  FaUserGraduate,
  FaGraduationCap,
  FaUsers,
  FaLayerGroup,
  FaCalendarCheck,
  FaCheckCircle,
  FaUserPlus,
  FaFolderPlus,
  FaSyncAlt,
  FaArrowRight,
  FaComments,
  FaExternalLinkAlt,
} from "react-icons/fa";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    alumniCount: 0,
    currentStudentCount: 0,
    totalBatches: 0,
    activeBatchesCount: 0,
    finishedBatchesCount: 0,
  });

  const parseDateOnly = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
    }
    return new Date(dateStr);
  };

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [batchRes, studentRes] = await Promise.all([
        axiosInstance.get("/batch/"),
        axiosInstance.get("/student/"),
      ]);

      const batches = Array.isArray(batchRes.data) ? batchRes.data : [];
      const students = Array.isArray(studentRes.data) ? studentRes.data : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create lookup map for batches
      const batchMap = {};
      let activeBatches = 0;
      let finishedBatches = 0;

      batches.forEach((b) => {
        const endDate = parseDateOnly(b.end_date);
        const isFinished = endDate ? endDate < today : false;
        if (isFinished) {
          finishedBatches++;
        } else {
          activeBatches++;
        }
        batchMap[b.id] = {
          ...b,
          isFinished,
          isActive: !isFinished,
        };
      });

      let alumni = 0;
      let currentStudents = 0;

      students.forEach((s) => {
        const batch = batchMap[s.batch_id];
        if (batch) {
          if (batch.isFinished) {
            alumni++;
          } else {
            currentStudents++;
          }
        } else {
          currentStudents++;
        }
      });

      setStats({
        totalStudents: students.length,
        alumniCount: alumni,
        currentStudentCount: currentStudents,
        totalBatches: batches.length,
        activeBatchesCount: activeBatches,
        finishedBatchesCount: finishedBatches,
      });
    } catch (err) {
      console.error("Error loading admin dashboard stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("admin_active", "true");
    localStorage.setItem("is_admin", "true");
    fetchDashboardData();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg, #F8FAFC)", paddingBottom: "70px" }}>
      <AdminNav />

      <div className="container py-4" style={{ maxWidth: "1160px" }}>
        {/* Modern Header Banner */}
        <div
          className="position-relative overflow-hidden mb-4 p-4 p-md-5 text-white"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #334155 100%)",
            borderRadius: "20px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }}></span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.5px" }} className="text-white-50 text-uppercase">
                  System Overview
                </span>
              </div>
              <h1 className="brand-font text-white mb-1" style={{ fontSize: "1.85rem", fontWeight: 800 }}>
                Admin Dashboard
              </h1>
              <p className="text-white-50 mb-0" style={{ fontSize: "0.92rem" }}>
                Manage students, cohorts, and portal engagement from a central console.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2.5">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing || loading}
                className="btn btn-outline-light px-3.5 py-2 rounded-pill d-inline-flex align-items-center gap-2"
                style={{ fontSize: "0.85rem", fontWeight: 600, borderColor: "rgba(255,255,255,0.25)" }}
              >
                <FaSyncAlt className={refreshing ? "fa-spin" : ""} size={12} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
              <Link
                to="/"
                className="btn btn-light px-3.5 py-2 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm"
                style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}
              >
                <span>Portal Feed</span>
                <FaExternalLinkAlt size={11} />
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1: Students & Alumni Overview */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <h5 className="brand-font mb-0" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Students & Alumni
            </h5>
            <Link to="/admin/view-students" className="text-decoration-none font-weight-bold d-inline-flex align-items-center gap-1" style={{ fontSize: "0.84rem", color: "var(--ib-primary, #E42313)" }}>
              Manage All Students <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="row g-3">
            {/* Total Students */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted text-uppercase" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }}>
                    Total Students
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#EEF2FF",
                      color: "#4F46E5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaUsers size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="brand-font mb-1" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                    {loading ? "..." : stats.totalStudents}
                  </h2>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Registered student records
                  </span>
                </div>
              </div>
            </div>

            {/* Current Active Students */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted text-uppercase" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }}>
                    Active Students
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#ECFDF5",
                      color: "#10B981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaUserGraduate size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="brand-font mb-1 text-success" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                    {loading ? "..." : stats.currentStudentCount}
                  </h2>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Currently pursuing training
                  </span>
                </div>
              </div>
            </div>

            {/* Alumni */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted text-uppercase" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }}>
                    Graduated Alumni
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#FEF3C7",
                      color: "#D97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaGraduationCap size={20} />
                  </div>
                </div>
                <div>
                  <h2 className="brand-font mb-1 text-warning" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                    {loading ? "..." : stats.alumniCount}
                  </h2>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Graduated batch members
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Batches Overview */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <h5 className="brand-font mb-0" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Batch Cohorts
            </h5>
            <Link to="/admin/view-batch" className="text-decoration-none font-weight-bold d-inline-flex align-items-center gap-1" style={{ fontSize: "0.84rem", color: "var(--ib-primary, #E42313)" }}>
              Manage All Batches <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="row g-3">
            {/* Total Batches */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted text-uppercase" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }}>
                    Total Batches
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#EFF6FF",
                      color: "#2563EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaLayerGroup size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="brand-font mb-1" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                    {loading ? "..." : stats.totalBatches}
                  </h2>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    All created training batches
                  </span>
                </div>
              </div>
            </div>

            {/* Active Batches */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted text-uppercase" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }}>
                    Active Batches
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#F0FDF4",
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaCalendarCheck size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="brand-font mb-1 text-success" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                    {loading ? "..." : stats.activeBatchesCount}
                  </h2>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Ongoing cohorts
                  </span>
                </div>
              </div>
            </div>

            {/* Finished Batches */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted text-uppercase" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }}>
                    Completed Batches
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#F1F5F9",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaCheckCircle size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="brand-font mb-1 text-secondary" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                    {loading ? "..." : stats.finishedBatchesCount}
                  </h2>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Past graduated cohorts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Quick Management Actions */}
        <div>
          <h5 className="brand-font mb-3 px-1" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            Quick Actions
          </h5>

          <div className="row g-3">
            {/* Student Actions */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#EEF2FF",
                        color: "#4F46E5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaUserPlus size={16} />
                    </div>
                    <h6 className="brand-font mb-0" style={{ fontSize: "0.98rem", fontWeight: 700 }}>
                      Student Directory
                    </h6>
                  </div>
                  <p className="text-muted mb-4" style={{ fontSize: "0.84rem", lineHeight: "1.5" }}>
                    Enroll new students, map batch allocations, or edit registered profiles.
                  </p>
                </div>

                <div className="d-flex gap-2">
                  <Link
                    to="/admin/create-student"
                    className="btn btn-sm btn-primary px-3 py-1.5 rounded-pill font-weight-bold text-decoration-none"
                    style={{ fontSize: "0.82rem", background: "var(--ib-primary, #E42313)", borderColor: "var(--ib-primary, #E42313)" }}
                  >
                    + Add Student
                  </Link>
                  <Link
                    to="/admin/view-students"
                    className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill font-weight-bold text-decoration-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>

            {/* Batch Actions */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#ECFDF5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaFolderPlus size={16} />
                    </div>
                    <h6 className="brand-font mb-0" style={{ fontSize: "0.98rem", fontWeight: 700 }}>
                      Batch Cohorts
                    </h6>
                  </div>
                  <p className="text-muted mb-4" style={{ fontSize: "0.84rem", lineHeight: "1.5" }}>
                    Create new batches, configure program timelines, and review schedules.
                  </p>
                </div>

                <div className="d-flex gap-2">
                  <Link
                    to="/admin/create-batch"
                    className="btn btn-sm btn-success px-3 py-1.5 rounded-pill font-weight-bold text-decoration-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    + Create Batch
                  </Link>
                  <Link
                    to="/admin/view-batch"
                    className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill font-weight-bold text-decoration-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    View Batches
                  </Link>
                </div>
              </div>
            </div>

            {/* Community Feed Actions */}
            <div className="col-12 col-md-4">
              <div
                className="ib-card p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  borderRadius: "16px",
                  border: "1px solid var(--ib-border, #E2E8F0)",
                  background: "var(--ib-bg-surface, #FFFFFF)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#FFF1F2",
                        color: "#E42313",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaComments size={16} />
                    </div>
                    <h6 className="brand-font mb-0" style={{ fontSize: "0.98rem", fontWeight: 700 }}>
                      Community & Feed
                    </h6>
                  </div>
                  <p className="text-muted mb-4" style={{ fontSize: "0.84rem", lineHeight: "1.5" }}>
                    Browse alumni discussions, student updates, and portal activities.
                  </p>
                </div>

                <div className="d-flex gap-2">
                  <Link
                    to="/"
                    className="btn btn-sm btn-outline-primary px-3 py-1.5 rounded-pill font-weight-bold text-decoration-none"
                    style={{ fontSize: "0.82rem", borderColor: "var(--ib-primary, #E42313)", color: "var(--ib-primary, #E42313)" }}
                  >
                    Feed Stream
                  </Link>
                  <Link
                    to="/view-all-posts"
                    className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill font-weight-bold text-decoration-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    All Posts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;