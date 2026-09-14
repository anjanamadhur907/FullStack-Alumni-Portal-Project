import { useEffect, useRef, useState } from "react";
import AdminNav from "./AdminNav";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axios-config/api";
import { FaUserPlus, FaArrowLeft, FaIdCard } from "react-icons/fa";

function AdminCreateStudent() {
  const nameInput = useRef("");
  const batchIdInput = useRef();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await axiosInstance.get("/batch/");
        setBatches(res.data || []);
      } catch (err) {
        console.error("Error loading batches:", err);
      }
    };
    loadBatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const name = nameInput.current.value.trim();
      const batch_id = Number(batchIdInput.current.value);
      if (!name || !batch_id) {
        toast.warning("Please fill all required fields");
        setSubmitting(false);
        return;
      }

      const response = await axiosInstance.post("/student/", { name, batch_id });
      console.log(response.data);
      toast.success(`Scholar "${name}" registered successfully with Card ID!`);
      navigate("/admin/view-students");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create student.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <AdminNav />

      <div className="container py-5" style={{ maxWidth: "560px" }}>
        <div className="mb-3">
          <Link
            to="/admin/dashboard"
            className="text-muted text-decoration-none d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: "0.85rem" }}
          >
            <FaArrowLeft size={12} /> Back to Dashboard
          </Link>
        </div>

        <div
          className="ib-card p-4 shadow-sm"
          style={{ borderRadius: "20px", border: "1px solid #E2E8F0", background: "#FFF" }}
        >
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-2"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#EEF2FF",
                color: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaUserPlus size={22} />
            </div>
            <h3 className="brand-font font-weight-bold text-dark mb-1" style={{ fontSize: "1.45rem" }}>
              Add New Student Master
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
              Card ID will be auto-generated upon registration (e.g. INF01XXXXX).
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label font-weight-bold text-dark" style={{ fontSize: "0.85rem" }}>
                Full Student Name <span className="text-danger">*</span>
              </label>
              <input
                ref={nameInput}
                type="text"
                className="form-control py-2.5 px-3"
                placeholder="e.g. Rahul Sharma"
                required
                style={{ borderRadius: "10px", fontSize: "0.9rem" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label font-weight-bold text-dark" style={{ fontSize: "0.85rem" }}>
                Assign Batch <span className="text-danger">*</span>
              </label>
              {batches.length > 0 ? (
                <select
                  ref={batchIdInput}
                  className="form-select py-2.5 px-3"
                  required
                  style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                >
                  <option value="">Select a batch cohort...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      Batch #{b.id} - {b.name} ({b.start_date || "Start"} to {b.end_date || "End"})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  ref={batchIdInput}
                  type="number"
                  className="form-control py-2.5 px-3"
                  placeholder="Enter Batch ID (e.g. 1)"
                  required
                  style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-ib-primary w-100 py-2.5 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: "0.92rem" }}
            >
              <FaIdCard size={15} />
              <span>{submitting ? "Registering Scholar..." : "Generate Card & Register"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateStudent;