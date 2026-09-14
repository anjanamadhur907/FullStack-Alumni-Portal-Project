import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../nav/Nav";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser, getProfile } from "../redux-config/UserSlice";
import axiosInstance from "../axios-config/api";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

function Signin() {
  const emailInput = useRef("");
  const passwordInput = useRef("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = emailInput.current.value;
    const password = passwordInput.current.value;

    try {
      const response = await axiosInstance.post("/auth/signin", { email, password });
      localStorage.removeItem("is_admin");
      sessionStorage.removeItem("admin_active");
      dispatch(setUser(response.data));

      try {
        const pRes = await axiosInstance.get("/profile/me", {
          headers: { Authorization: "Bearer " + response.data.token },
        });
        dispatch(getProfile(pRes.data));
      } catch (pErr) {
        console.error("Profile fetch error on signin:", pErr);
      }

      toast.success("Signed in successfully");
      navigate("/");
    } catch (err) {
      try {
        const response = await axiosInstance.post("/admin/login", { email, password });
        localStorage.setItem("is_admin", "true");
        dispatch(setUser({ ...response.data, is_admin: true, role: "Admin" }));
        toast.success("Admin login successful");
        navigate("/admin/dashboard");
      } catch (adminErr) {
        console.error(err);
        toast.error(err.response?.data?.detail || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
      <Navbar />

      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 120px)" }}>
        <div className="ib-card p-4 p-md-5" style={{ width: "100%", maxWidth: "460px", borderRadius: "18px" }}>
          {/* Header with Official InfoBeans Foundation Logo */}
          <div className="text-center mb-4">
            <div
              style={{
                background: "#FFF9ED",
                padding: "8px 14px",
                borderRadius: "12px",
                display: "inline-block",
                marginBottom: "16px",
              }}
            >
              <img
                src="/infobeans-foundation-logo.png"
                alt="InfoBeans Foundation"
                style={{
                  height: "48px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <h3 className="brand-font font-weight-bold mb-1">
              Portal Sign In
            </h3>
            <p className="text-muted" style={{ fontSize: "0.86rem" }}>
              Welcome to InfoBeans Foundation Alumni Network
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                Email Address
              </label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                    <FaEnvelope size={13} />
                  </span>
                </div>
                <input
                  ref={emailInput}
                  className="form-control border-left-0"
                  type="email"
                  placeholder="Enter email id"
                  required
                  style={{ borderRadius: "0 10px 10px 0", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                Password
              </label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                    <FaLock size={13} />
                  </span>
                </div>
                <input
                  ref={passwordInput}
                  className="form-control border-left-0"
                  type="password"
                  placeholder="Enter password"
                  required
                  style={{ borderRadius: "0 10px 10px 0", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ib-primary w-100 py-2.5 rounded-pill font-weight-bold mb-3"
              style={{ fontSize: "0.92rem" }}
            >
              {loading ? "Signing in..." : "Sign In"} <FaArrowRight size={11} className="ml-1" />
            </button>

            <div className="text-center pt-2 border-top">
              <span className="text-muted" style={{ fontSize: "0.84rem" }}>
                Need an account?{" "}
              </span>
              <Link to="/signup" className="font-weight-bold" style={{ fontSize: "0.84rem", color: "#E42313" }}>
                Register with Card ID
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signin;