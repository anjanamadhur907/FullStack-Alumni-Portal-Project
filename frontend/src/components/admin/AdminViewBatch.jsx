
import { useEffect, useReducer } from "react";
import AdminNav from "./AdminNav";
import axiosInstance from "../axios-config/api";
import { Link } from "react-router-dom";
import { FaLayerGroup, FaPlus, FaTrashAlt } from "react-icons/fa";

function AdminViewBatch() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      if (action.type === "set-batches") state.batches = action.payload;
      return { ...state };
    },
    {
      batches: [],
    }
  );

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const response = await axiosInstance.get("/batch/");
      dispatch({ type: "set-batches", payload: response.data });
    } catch (err) {
      console.error("Error loading batches:", err);
    }
  };

  const deleteBatch = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await axiosInstance.delete(`/batch/${id}`);
        loadBatches();
      } catch (err) {
        console.error("Error deleting batch:", err);
      }
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isBatchFinished = (endDateStr) => {
    if (!endDateStr) return false;
    const parts = String(endDateStr).split("-");
    const d = parts.length === 3 ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)) : new Date(endDateStr);
    return d < today;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <AdminNav />
      <div className="container py-4" style={{ maxWidth: "1140px" }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#ECFEFF",
                color: "#0891B2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaLayerGroup size={20} />
            </div>
            <div>
              <h3 className="brand-font font-weight-bold text-dark mb-0" style={{ fontSize: "1.5rem" }}>
                Batch Cohort Management
              </h3>
              <small className="text-muted">Total Batches: {state?.batches?.length || 0}</small>
            </div>
          </div>

          <Link
            to="/admin/create-batch"
            className="btn btn-success px-3.5 py-2 rounded-pill font-weight-bold text-white d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem" }}
          >
            <FaPlus size={12} />
            <span>Create New Batch</span>
          </Link>
        </div>

        <div className="ib-card overflow-hidden shadow-sm" style={{ borderRadius: "16px", border: "1px solid #E2E8F0" }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead style={{ background: "#0F172A", color: "#FFF" }}>
                <tr>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>S.No.</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Batch ID</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Batch Name</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Timeline (Start - End)</th>
                  <th className="py-3 px-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Status</th>
                  <th className="py-3 px-4 text-center" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {state?.batches && state.batches.length > 0 ? (
                  state.batches.map((batch, index) => {
                    const finished = isBatchFinished(batch.end_date);
                    return (
                      <tr key={batch.id}>
                        <td className="py-3 px-4 text-muted font-weight-bold">{index + 1}</td>
                        <td className="py-3 px-4 font-weight-bold text-dark">#{batch.id}</td>
                        <td className="py-3 px-4 font-weight-bold text-primary">{batch.name}</td>
                        <td className="py-3 px-4 text-muted" style={{ fontSize: "0.88rem" }}>
                          {batch.start_date || "N/A"} → {batch.end_date || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          {finished ? (
                            <span className="badge bg-secondary-subtle text-secondary px-2.5 py-1 rounded-pill" style={{ fontSize: "0.75rem" }}>
                              Finished
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success px-2.5 py-1 rounded-pill" style={{ fontSize: "0.75rem" }}>
                              Active Running
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteBatch(batch.id)}
                            className="btn btn-sm btn-outline-danger px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1.5"
                            style={{ fontSize: "0.78rem" }}
                          >
                            <FaTrashAlt size={11} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No batches found in database.
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

export default AdminViewBatch;