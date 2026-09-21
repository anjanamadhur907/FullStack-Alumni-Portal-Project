import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../redux-config/UserSlice";
import {
  FaSignOutAlt,
  FaArrowLeft,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaUsers,
  FaUserPlus,
  FaLayerGroup,
  FaPlus,
} from "react-icons/fa";

function AdminNav() {
  const { isLoggedIn } = useSelector((store) => store.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    try {
      localStorage.removeItem("is_admin");
      sessionStorage.removeItem("admin_active");
    } catch (e) {
      console.error(e);
    }
    dispatch(signOut());
    navigate("/signin");
  };

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FaShieldAlt size={12} /> },
    { to: "/admin/create-student", label: "+ Add Student", icon: <FaUserPlus size={12} /> },
    { to: "/admin/view-students", label: "Manage Students", icon: <FaUsers size={12} /> },
    { to: "/admin/create-batch", label: "+ Create Batch", icon: <FaPlus size={11} /> },
    { to: "/admin/view-batch", label: "Batches", icon: <FaLayerGroup size={12} /> },
  ];

  return (
    <nav
      className="navbar navbar-dark shadow-sm py-2 position-sticky top-0"
      style={{
        background: "#0F172A",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        zIndex: 1040,
      }}
    >
      <div className="container d-flex align-items-center justify-content-between flex-wrap">
        {/* Brand Logo with infobeanslogo.png */}
        <Link className="navbar-brand d-flex align-items-center gap-2.5 text-white font-weight-bold" to="/admin/dashboard">
          <div
            style={{
              background: "#FFFFFF",
              padding: "4px 10px",
              borderRadius: "10px",
              display: "inline-flex",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src="/infobeanslogo.png"
              alt="InfoBeans"
              style={{
                height: "26px",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                e.currentTarget.src = "/infobeans-logo.png";
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: "0.92rem", fontWeight: 700, letterSpacing: "-0.01em" }}>InfoBeans Admin</span>
            <small className="d-block text-white-50" style={{ fontSize: "0.65rem" }}>
              Operations Console
            </small>
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <div className="d-flex d-lg-none align-items-center gap-2">
          <NavLink
            to="/"
            className="btn btn-sm btn-outline-light px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1"
            style={{ fontSize: "0.75rem", borderColor: "rgba(255,255,255,0.2)" }}
          >
            <FaArrowLeft size={9} /> Feed
          </NavLink>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "34px", height: "34px", padding: 0 }}
          >
            {mobileOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="d-none d-lg-flex align-items-center mx-auto gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `nav-link px-3 py-1.5 rounded-pill font-weight-bold d-flex align-items-center gap-1.5 ${
                  isActive ? "text-white" : "text-white-50"
                }`
              }
              style={({ isActive }) => ({
                fontSize: "0.82rem",
                backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
                transition: "all 0.15s ease",
              })}
              to={link.to}
            >
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="d-none d-lg-flex align-items-center gap-2">
          <NavLink
            to="/"
            className="btn btn-sm btn-outline-light px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 font-weight-bold"
            style={{ fontSize: "0.8rem", borderColor: "rgba(255,255,255,0.25)" }}
          >
            <FaArrowLeft size={10} /> Portal Feed
          </NavLink>

          {isLoggedIn && (
            <button
              onClick={handleSignOut}
              className="btn btn-sm btn-danger px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 font-weight-bold"
              style={{ fontSize: "0.8rem" }}
            >
              <FaSignOutAlt size={11} /> Sign Out
            </button>
          )}
        </div>

        {/* Mobile Dropdown Menu (When toggled on small screens) */}
        {mobileOpen && (
          <div
            className="d-lg-none w-100 mt-2 pt-2 border-top"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <div className="d-flex flex-column gap-1.5 mb-2.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg font-weight-bold d-flex align-items-center gap-2 text-decoration-none ${
                      isActive ? "text-white" : "text-white-50"
                    }`
                  }
                  style={({ isActive }) => ({
                    fontSize: "0.86rem",
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.04)",
                  })}
                  to={link.to}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="d-flex align-items-center gap-2 pt-2 border-top" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <NavLink
                to="/"
                onClick={() => setMobileOpen(false)}
                className="btn btn-sm btn-outline-light w-50 py-1.5 rounded-pill d-inline-flex align-items-center justify-content-center gap-1.5 font-weight-bold"
                style={{ fontSize: "0.8rem" }}
              >
                <FaArrowLeft size={10} /> Portal Feed
              </NavLink>

              {isLoggedIn && (
                <button
                  onClick={handleSignOut}
                  className="btn btn-sm btn-danger w-50 py-1.5 rounded-pill d-inline-flex align-items-center justify-content-center gap-1.5 font-weight-bold"
                  style={{ fontSize: "0.8rem" }}
                >
                  <FaSignOutAlt size={11} /> Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default AdminNav;