import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../nav/Nav";
import axiosInstance from "../axios-config/api";
import { toast } from "react-toastify";
import { FaIdCard, FaEnvelope, FaLock, FaPhone, FaCheckCircle, FaArrowRight } from "react-icons/fa";

function Signup() {
  const [cardId, setCardId] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const cardIdInput = useRef("");
  const emailInput = useRef("");
  const passwordInput = useRef("");
  const contactInput = useRef("");

  const verifyCard = async (e) => {
    e.preventDefault();
    if (!cardId.trim()) {
      toast.error("Please enter a Card ID");
      return;
    }

    setVerifying(true);
    try {
      const response = await axiosInstance.post("/auth/verify_card", { card_id: cardId });
      setVerified(true);
      toast.success("Card ID verified successfully!");
    } catch (err) {
      setVerified(false);
      console.error(err);
      toast.error(err.response?.data?.detail || "Invalid or unregistered Card ID");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const card_id = cardIdInput.current.value;
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    const mobile = contactInput.current.value;

    try {
      await axiosInstance.post("/auth/signup", { card_id, email, mobile, password });
      toast.success("Account created successfully! Please sign in.");
      navigate("/signin");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
      <Navbar />

      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 120px)" }}>
        <div className="ib-card p-4 p-md-5" style={{ width: "100%", maxWidth: "480px", borderRadius: "18px" }}>
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
              Member Registration
            </h3>
            <p className="text-muted" style={{ fontSize: "0.86rem" }}>
              Verify Card ID to activate your portal account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Card ID */}
            <div className="form-group mb-3">
              <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                Enter Card ID *
              </label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                    <FaIdCard size={13} />
                  </span>
                </div>
                <input
                  ref={cardIdInput}
                  readOnly={verified}
                  onChange={(e) => setCardId(e.target.value)}
                  value={cardId}
                  className="form-control border-left-0"
                  type="text"
                  placeholder="e.g. INFO-XXXXXX"
                  required
                  style={{ fontSize: "0.9rem" }}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    onClick={verifyCard}
                    disabled={verified || verifying}
                    className={`btn px-3 font-weight-bold ${
                      verified ? "btn-success" : "btn-ib-primary"
                    }`}
                    style={{ borderRadius: "0 10px 10px 0", fontSize: "0.82rem" }}
                  >
                    {verified ? (
                      <>
                        <FaCheckCircle size={11} className="mr-1" /> Verified
                      </>
                    ) : verifying ? (
                      "Checking..."
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
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
                  disabled={!verified}
                  className="form-control border-left-0"
                  type="email"
                  placeholder="Enter email id"
                  required
                  style={{ borderRadius: "0 10px 10px 0", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group mb-3">
              <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                Create Password
              </label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                    <FaLock size={13} />
                  </span>
                </div>
                <input
                  ref={passwordInput}
                  disabled={!verified}
                  className="form-control border-left-0"
                  type="password"
                  placeholder="Enter password"
                  required
                  style={{ borderRadius: "0 10px 10px 0", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="form-group mb-4">
              <label className="text-muted font-weight-bold mb-1" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                Contact Number
              </label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text border-right-0" style={{ borderRadius: "10px 0 0 10px" }}>
                    <FaPhone size={13} />
                  </span>
                </div>
                <input
                  ref={contactInput}
                  disabled={!verified}
                  className="form-control border-left-0"
                  type="tel"
                  placeholder="Enter mobile number"
                  required
                  style={{ borderRadius: "0 10px 10px 0", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!verified || submitting}
              className="btn-ib-primary w-100 py-2.5 rounded-pill font-weight-bold mb-3"
              style={{ fontSize: "0.92rem" }}
            >
              {submitting ? "Signing up..." : "Sign Up"} <FaArrowRight size={11} className="ml-1" />
            </button>

            <div className="text-center pt-2 border-top">
              <span className="text-muted" style={{ fontSize: "0.84rem" }}>
                Already have an account?{" "}
              </span>
              <Link to="/signin" className="font-weight-bold" style={{ fontSize: "0.84rem", color: "#E42313" }}>
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;