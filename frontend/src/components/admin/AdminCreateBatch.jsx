import { useRef, useState } from "react";
import AdminNav from "./AdminNav";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axios-config/api";
import { FaFolderPlus, FaArrowLeft, FaCheck } from "react-icons/fa";

function AdminCreateBatch() {
  const batchidInput = useRef(null);
  const batchnameInput = useRef("");
  const startdateInput = useRef("");
  const enddateInput = useRef("");
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = Number(batchidInput.current.value);
      const name = batchnameInput.current.value.trim();
      const start_date = startdateInput.current.value;
      const end_date = enddateInput.current.value;

      if (!id || !name || !start_date || !end_date) {
        toast.warning("Please fill all batch details");
        setSubmitting(false);
        return;
      }

      const response = await axiosInstance.post("/batch/", { id, name, start_date, end_date });
      toast.success(`Batch #${id} "${name}" created successfully!`);
      navigate("/admin/view-batch");
      console.log(response.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create batch.");
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
                background: "#ECFDF5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaFolderPlus size={22} />
            </div>
            <h3 className="brand-font font-weight-bold text-dark mb-1" style={{ fontSize: "1.45rem" }}>
              Create New Batch Cohort
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
              Define training batch schedule, start date, and completion date.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label font-weight-bold text-dark" style={{ fontSize: "0.85rem" }}>
                Batch ID (Numeric Code) <span className="text-danger">*</span>
              </label>
              <input
                ref={batchidInput}
                type="number"
                className="form-control py-2.5 px-3"
                placeholder="e.g. 101, 102, 1"
                required
                style={{ borderRadius: "10px", fontSize: "0.9rem" }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label font-weight-bold text-dark" style={{ fontSize: "0.85rem" }}>
                Batch Cohort Name <span className="text-danger">*</span>
              </label>
              <input
                ref={batchnameInput}
                type="text"
                className="form-control py-2.5 px-3"
                placeholder="e.g. MERN Full Stack 2025"
                required
                style={{ borderRadius: "10px", fontSize: "0.9rem" }}
              />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label font-weight-bold text-dark" style={{ fontSize: "0.85rem" }}>
                  Start Date <span className="text-danger">*</span>
                </label>
                <input
                  ref={startdateInput}
                  type="date"
                  className="form-control py-2.5 px-3"
                  required
                  style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label font-weight-bold text-dark" style={{ fontSize: "0.85rem" }}>
                  End Date <span className="text-danger">*</span>
                </label>
                <input
                  ref={enddateInput}
                  type="date"
                  className="form-control py-2.5 px-3"
                  required
                  style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-success w-100 py-2.5 rounded-pill font-weight-bold text-white d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: "0.92rem" }}
            >
              <FaCheck size={14} />
              <span>{submitting ? "Creating Batch..." : "Create Batch Cohort"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateBatch;

