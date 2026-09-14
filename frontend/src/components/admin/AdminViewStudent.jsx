import { useEffect, useRef, useState } from "react";
import AdminNav from "./AdminNav";
import axiosInstance from "../axios-config/api";
import { Link } from "react-router-dom";
import { FaUserGraduate, FaUserPlus, FaSearch, FaList, FaTimes } from "react-icons/fa";

function AdminViewStudent() {
  const batchRef = useRef();

  const [batches, setBatches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getBatches();
    getAllStudents();
  }, []);

  const getBatches = async () => {
    try {
      const res = await axiosInstance.get("/batch/");
      setBatches(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getAllStudents = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/student/");
      const data = res.data || [];
      setAllStudents(data);
      setStudents(data);
      setSearchQuery("");
      if (batchRef.current) batchRef.current.value = "all";
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const searchStudent = async () => {
    const batchId = batchRef.current?.value || "all";
    setLoading(true);

    try {
      let data = [];
      if (batchId === "all") {
        const res = await axiosInstance.get("/student/");
        data = res.data || [];
      } else {
        const res = await axiosInstance.get(`/student/${batchId}`);
        data = res.data || [];
      }
      setAllStudents(data);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const filtered = data.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.card_id?.toLowerCase().includes(q)
        );
        setStudents(filtered);
      } else {
        setStudents(data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setStudents(allStudents);
      return;
    }
    const q = query.toLowerCase().trim();
    const filtered = allStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.card_id?.toLowerCase().includes(q)
    );
    setStudents(filtered);
  };

  // Map batch lookup
  const batchMap = {};
  batches.forEach((b) => {
    batchMap[b.id] = b.name;
  });

  // Avatar colors helper
  const avatarColors = [
    "linear-gradient(135deg, #4F46E5, #06B6D4)",
    "linear-gradient(135deg, #E42313, #EA1B3D)",
    "linear-gradient(135deg, #059669, #10B981)",
    "linear-gradient(135deg, #D97706, #F59E0B)",
    "linear-gradient(135deg, #7C3AED, #A855F7)",
    "linear-gradient(135deg, #2563EB, #3B82F6)",
  ];

  const getAvatarBg = (id, name) => {
    const charCode = (name || "S").charCodeAt(0) + (id || 0);
    return avatarColors[charCode % avatarColors.length];
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingBottom: "60px" }}>
      <AdminNav />
      <div className="container py-4" style={{ maxWidth: "1140px" }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#EEF2FF",
                color: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaUserGraduate size={20} />
            </div>
            <div>
              <h3 className="brand-font font-weight-bold text-dark mb-0" style={{ fontSize: "1.45rem" }}>
                Student Directory
              </h3>
              <small className="text-muted">Total Registered Scholars: {allStudents.length}</small>
            </div>
          </div>

          <Link
            to="/admin/create-student"
            className="btn btn-primary px-3.5 py-2 rounded-pill font-weight-bold text-decoration-none d-flex align-items-center gap-2 shadow-sm"
            style={{ fontSize: "0.85rem", background: "var(--ib-primary, #E42313)", borderColor: "var(--ib-primary, #E42313)" }}
          >
            <FaUserPlus size={12} />
            <span>+ Add New Student</span>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="ib-card p-3.5 mb-4 shadow-sm" style={{ borderRadius: "16px", border: "1px solid #E2E8F0", background: "#FFFFFF" }}>
          <div className="row g-2.5 align-items-center">
            {/* Search Query Input */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FaSearch size={13} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-1"
                  placeholder="Search by student name or Card ID..."
                  value={searchQuery}
                  onChange={handleTextSearch}
                  style={{ fontSize: "0.88rem" }}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStudents(allStudents);
                    }}
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Batch Filter Dropdown */}
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light text-muted" style={{ fontSize: "0.82rem" }}>
                  Batch:
                </span>
                <select className="form-select" ref={batchRef} defaultValue="all" onChange={searchStudent} style={{ fontSize: "0.86rem" }}>
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} (Batch #{batch.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View All / Reset */}
            <div className="col-12 col-md-3">
              <button
                className="btn btn-light border w-100 rounded-pill d-flex align-items-center justify-content-center gap-1.5 font-weight-bold text-dark"
                onClick={getAllStudents}
                style={{ fontSize: "0.85rem", height: "38px" }}
              >
                <FaList size={12} />
                <span>Show All ({allStudents.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student Table with Images / Avatars */}
        <div className="ib-card overflow-hidden shadow-sm" style={{ borderRadius: "16px", border: "1px solid #E2E8F0", background: "#FFFFFF" }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead style={{ background: "#0F172A", color: "#FFF" }}>
                <tr>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>S.No.</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Student Profile & Photo</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Card ID</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Assigned Batch</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Batch ID</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      Loading student records...
                    </td>
                  </tr>
                ) : students && students.length > 0 ? (
                  students.map((student, idx) => {
                    const initials = student.name
                      ? student.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "ST";

                    return (
                      <tr key={student.id || idx}>
                        <td className="py-3 px-4 text-muted font-weight-bold">{idx + 1}</td>

                        {/* Student Image / Avatar + Name */}
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background: getAvatarBg(student.id, student.name),
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.92rem",
                                flexShrink: 0,
                                boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                              }}
                              title={student.name}
                            >
                              {initials}
                            </div>
                            <div>
                              <span className="font-weight-bold text-dark d-block" style={{ fontSize: "0.92rem" }}>
                                {student.name}
                              </span>
                              <small className="text-muted" style={{ fontSize: "0.76rem" }}>
                                Enrolled Student
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="badge bg-light text-dark border px-2.5 py-1.5 font-monospace" style={{ fontSize: "0.8rem" }}>
                            {student.card_id}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill font-weight-bold" style={{ fontSize: "0.78rem" }}>
                            {batchMap[student.batch_id] || `Batch #${student.batch_id}`}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-muted" style={{ fontSize: "0.85rem" }}>
                          #{student.batch_id}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <div className="mb-2">
                        <FaSearch size={24} className="text-muted opacity-50" />
                      </div>
                      <span className="d-block font-weight-bold text-dark">No students found matching your search</span>
                      <small className="text-muted">Try clearing the search query or changing the batch filter.</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminViewStudent;
