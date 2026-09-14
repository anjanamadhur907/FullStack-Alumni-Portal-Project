import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../redux-config/UserSlice";
import {
  FaSignOutAlt,
  FaArrowLeft,
} from "react-icons/fa";

function AdminNav() {
  const { isLoggedIn } = useSelector((store) => store.user);
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

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm py-2"
      style={{ background: "#0F172A", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
    >
      <div className="container">
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
                height: "28px",
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
            <span style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em" }}>InfoBeans Admin</span>
            <small className="d-block text-white-50" style={{ fontSize: "0.68rem" }}>
              Management Console
            </small>
          </div>
        </Link>

        <div className="collapse navbar-collapse show" id="adminNavbar">
          <ul className="navbar-nav mx-auto gap-1">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill font-weight-bold ${
                    isActive ? "text-white bg-white-10" : "text-white-50"
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: "0.85rem",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
                })}
                to="/admin/dashboard"
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill font-weight-bold ${
                    isActive ? "text-white bg-white-10" : "text-white-50"
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: "0.85rem",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
                })}
                to="/admin/create-student"
              >
                + Add Student
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill font-weight-bold ${
                    isActive ? "text-white bg-white-10" : "text-white-50"
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: "0.85rem",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
                })}
                to="/admin/view-students"
              >
                Manage Students
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill font-weight-bold ${
                    isActive ? "text-white bg-white-10" : "text-white-50"
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: "0.85rem",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
                })}
                to="/admin/create-batch"
              >
                + Create Batch
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 rounded-pill font-weight-bold ${
                    isActive ? "text-white bg-white-10" : "text-white-50"
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: "0.85rem",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
                })}
                to="/admin/view-batch"
              >
                Batches
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            <NavLink
              to="/"
              className="btn btn-sm btn-outline-light px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: "0.8rem", borderColor: "rgba(255,255,255,0.2)" }}
            >
              <FaArrowLeft size={10} /> Portal Feed
            </NavLink>

            {isLoggedIn && (
              <button
                onClick={handleSignOut}
                className="btn btn-sm btn-danger px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: "0.8rem" }}
              >
                <FaSignOutAlt size={11} /> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNav;