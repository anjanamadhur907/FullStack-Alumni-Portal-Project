import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut, setCategoryFilter, getProfile } from "../redux-config/UserSlice";
import axiosInstance from "../axios-config/api";
import {
  FaPlus,
  FaSignOutAlt,
  FaUser,
  FaSun,
  FaMoon,
  FaSignInAlt,
  FaUserPlus,
  FaLayerGroup,
  FaLightbulb,
  FaCalendarAlt,
  FaBullhorn,
  FaBars,
  FaTimes,
  FaUserTie,
  FaGraduationCap,
  FaShieldAlt,
} from "react-icons/fa";

const CATEGORIES = [
  { id: "General", label: "General", icon: FaLightbulb },
  { id: "Event", label: "Event", icon: FaCalendarAlt },
  { id: "Announcement", label: "Announcement", icon: FaBullhorn },
];

function Navbar() {
  const { isLoggedIn, currentUser, profile_data, selectedCategory } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  const isAdmin =
    isLoggedIn &&
    (currentUser?.is_admin ||
      currentUser?.role === "Admin" ||
      profile_data?.role === "Admin" ||
      localStorage.getItem("is_admin") === "true" ||
      sessionStorage.getItem("admin_active") === "true");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ib_theme") || "light";
  });

  const [visible, setVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !isAdmin && currentUser?.token) {
      axiosInstance
        .get("/profile/me")
        .then((res) => {
          if (res.data) dispatch(getProfile(res.data));
        })
        .catch((err) => console.error("Nav profile fetch error:", err));
    }
  }, [isLoggedIn, isAdmin, currentUser?.token]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ib_theme", theme);
  }, [theme]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Disable body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80 && !drawerOpen) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [drawerOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isAlumni =
    isLoggedIn &&
    (profile_data?.role === "Alumni" || currentUser?.role === "Alumni");

  const handlePost = () => {
    setDrawerOpen(false);
    navigate("/post");
  };

  const handleSignOut = () => {
    setDrawerOpen(false);
    try {
      localStorage.removeItem("is_admin");
      sessionStorage.removeItem("admin_active");
    } catch (e) {
      console.error(e);
    }
    dispatch(signOut());
    navigate("/signin");
  };

  const handleSelectCategory = (catId) => {
    dispatch(setCategoryFilter(catId));
    setDrawerOpen(false);
    if (!isHome) {
      navigate("/");
    }
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1030,
          backgroundColor: "var(--ib-nav-bg)",
          borderBottom: "1px solid var(--ib-border)",
          boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        {/* Top Subtle Foundation Accent Strip */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, #E42313 0%, #EA1B3D 50%, #005DA6 100%)",
          }}
        />

        {/* Main Navbar Bar */}
        <nav className="navbar navbar-expand-lg navbar-light py-2 px-0">
          <div className="container-fluid" style={{ maxWidth: "1240px", padding: "0 16px" }}>
            {/* Official InfoBeans Foundation Logo */}
            <NavLink className="navbar-brand d-flex align-items-center py-0 mr-2" to="/">
              <div
                style={{
                  background: "#FFF9ED",
                  padding: "3px 8px",
                  borderRadius: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <img
                  src="/infobeans-foundation-logo.png"
                  alt="InfoBeans Foundation"
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            </NavLink>

            {/* Desktop Center Category Pills */}
            <div
              className="d-none d-lg-flex align-items-center gap-2 mx-auto"
              style={{ overflowX: "auto", scrollbarWidth: "none", flexWrap: "nowrap" }}
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className="btn btn-sm d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill font-weight-bold"
                    style={{
                      fontSize: "0.82rem",
                      background: isSelected ? "#E42313" : "var(--ib-bg-surface-secondary)",
                      color: isSelected ? "#FFF" : "var(--ib-text-main)",
                      border: "1px solid",
                      borderColor: isSelected ? "#E42313" : "var(--ib-border)",
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={12} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Right User Actions */}
            <div className="d-none d-lg-flex align-items-center flex-wrap ml-lg-auto justify-content-end" style={{ gap: "14px" }}>
              {/* Admin Console Switcher (When Admin is logged in) */}
              {isLoggedIn && isAdmin && (
                <NavLink
                  to="/admin/dashboard"
                  className="btn btn-sm rounded-pill px-3 py-1.5 font-weight-bold d-flex align-items-center gap-1.5 text-decoration-none shadow-sm"
                  style={{
                    fontSize: "0.82rem",
                    background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
                    color: "#FFF",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.25)",
                    whiteSpace: "nowrap",
                  }}
                  title="Return to Admin Operations Console"
                >
                  <FaShieldAlt size={12} color="#818CF8" />
                  <span>Admin Dashboard</span>
                </NavLink>
              )}

              {/* User Identity Chip */}
              {isLoggedIn && (
                isAdmin ? (
                  <div
                    className="d-flex align-items-center rounded-pill shadow-sm"
                    style={{
                      padding: "4px 14px 4px 6px",
                      gap: "8px",
                      background: "var(--ib-bg-surface-secondary)",
                      border: "1px solid var(--ib-border)",
                      color: "var(--ib-text-main)",
                      fontSize: "0.82rem",
                    }}
                    title="System Administrator"
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #4F46E5, #06B6D4)",
                        color: "#FFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      <FaShieldAlt size={12} />
                    </div>
                    <span className="font-weight-bold">Admin</span>
                  </div>
                ) : (
                  <NavLink
                    to="/student-profile"
                    className="d-flex align-items-center text-decoration-none rounded-pill"
                    style={({ isActive }) => ({
                      padding: "4px 14px 4px 6px",
                      gap: "8px",
                      background: isActive ? "rgba(228, 35, 19, 0.15)" : "var(--ib-bg-surface-secondary)",
                      border: "1px solid",
                      borderColor: isActive ? "#E42313" : "var(--ib-border)",
                      color: isActive ? "#E42313" : "var(--ib-text-main)",
                      fontSize: "0.82rem",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    })}
                    title={`View Profile (${profile_data?.name || "Member"})`}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #E42313, #EA1B3D)",
                        color: "#FFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(228, 35, 19, 0.3)",
                        flexShrink: 0,
                      }}
                    >
                      {profile_data?.name ? profile_data.name.charAt(0).toUpperCase() : <FaUser size={11} />}
                    </div>
                    <span className="font-weight-bold text-truncate" style={{ maxWidth: "95px" }}>
                      {profile_data?.name || "Profile"}
                    </span>
                  </NavLink>
                )
              )}

              {isLoggedIn && isAlumni && (
                <NavLink
                  className="nav-link px-2.5 py-1.5 rounded font-weight-bold"
                  to="/my-posts"
                  style={({ isActive }) => ({
                    fontSize: "0.84rem",
                    color: isActive ? "#E42313" : "var(--ib-text-main)",
                    whiteSpace: "nowrap",
                  })}
                >
                  My Posts
                </NavLink>
              )}

              {/* Create Post Button (For Alumni & Admin) */}
              {isLoggedIn && (isAlumni || isAdmin) && (
                <button
                  onClick={handlePost}
                  className="btn-ib-primary btn-sm px-3.5 py-1.5 rounded-pill d-flex align-items-center gap-1.5 font-weight-bold shadow-sm"
                  style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
                >
                  <FaPlus size={11} />
                  <span>Post</span>
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "36px",
                  height: "36px",
                  background: theme === "dark" ? "#1E293B" : "#F4F2EC",
                  color: theme === "dark" ? "#FBBF24" : "#475569",
                  border: "1px solid var(--ib-border)",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                }}
                title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
              >
                {theme === "light" ? <FaMoon size={14} color="#D97706" /> : <FaSun size={15} color="#FBBF24" />}
              </button>

              {/* Auth Action Buttons */}
              {!isLoggedIn ? (
                <div className="d-flex align-items-center" style={{ gap: "14px" }}>
                  <NavLink
                    to="/signin"
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center btn-nav-signin"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.45)" : "#E42313",
                      color: theme === "dark" ? "#FFFFFF" : "#E42313",
                      backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                      border: "1px solid",
                      transition: "all 0.2s ease",
                      padding: 0,
                      flexShrink: 0,
                    }}
                    title="Sign In"
                  >
                    <FaSignInAlt size={14} style={{ color: theme === "dark" ? "#FFFFFF" : "#E42313" }} />
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="btn-ib-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "36px",
                      height: "36px",
                      padding: 0,
                      flexShrink: 0,
                    }}
                    title="Register"
                  >
                    <FaUserPlus size={14} />
                  </NavLink>
                </div>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderColor: "var(--ib-border)",
                    color: "var(--ib-text-main)",
                    padding: 0,
                    flexShrink: 0,
                  }}
                  title="Sign Out"
                >
                  <FaSignOutAlt size={13} />
                </button>
              )}
            </div>

            {/* Mobile Header Right Controls (Sign In + Theme + Side Drawer Trigger) */}
            <div className="d-flex d-lg-none align-items-center gap-2">
              {!isLoggedIn && (
                <NavLink
                  to="/signin"
                  className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center btn-nav-signin"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.45)" : "#E42313",
                    color: theme === "dark" ? "#FFFFFF" : "#E42313",
                    backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(228, 35, 19, 0.06)",
                    border: "1px solid",
                    transition: "all 0.2s ease",
                    padding: 0,
                    flexShrink: 0,
                  }}
                  title="Sign In"
                >
                  <FaSignInAlt size={14} style={{ color: theme === "dark" ? "#FFFFFF" : "#E42313" }} />
                </NavLink>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "36px",
                  height: "36px",
                  background: theme === "dark" ? "#1E293B" : "#F4F2EC",
                  color: theme === "dark" ? "#FBBF24" : "#475569",
                  border: "1px solid var(--ib-border)",
                  cursor: "pointer",
                  padding: 0,
                }}
                title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
              >
                {theme === "light" ? <FaMoon size={14} color="#D97706" /> : <FaSun size={15} color="#FBBF24" />}
              </button>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "38px",
                  height: "38px",
                  background: "var(--ib-bg-surface-secondary)",
                  border: "1px solid var(--ib-border)",
                  color: "var(--ib-text-main)",
                  cursor: "pointer",
                }}
                aria-label="Open Menu"
              >
                <FaBars size={16} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ========================================================= */}
      {/* Off-Canvas Slide-out Side Drawer for Small Screens */}
      {/* ========================================================= */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(3px)",
            zIndex: 1040,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "310px",
          maxWidth: "85vw",
          backgroundColor: "var(--ib-bg-surface)",
          borderLeft: "1px solid var(--ib-border)",
          zIndex: 1050,
          boxShadow: drawerOpen ? "-6px 0 30px rgba(0,0,0,0.3)" : "none",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Drawer Header */}
        <div className="d-flex align-items-center justify-content-between p-3.5 border-bottom">
          <div
            style={{
              background: "#FFF9ED",
              padding: "3px 8px",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <img
              src="/infobeans-foundation-logo.png"
              alt="InfoBeans Foundation"
              style={{ height: "32px", width: "auto" }}
            />
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "32px",
              height: "32px",
              background: "var(--ib-bg-surface-secondary)",
              border: "1px solid var(--ib-border)",
              color: "var(--ib-text-main)",
            }}
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-3.5 d-flex flex-column gap-3.5 flex-grow-1">
          {/* User Identity Card in Drawer */}
          {isLoggedIn && (
            isAdmin ? (
              <div
                className="p-3 rounded-lg d-flex align-items-center gap-3"
                style={{
                  background: "var(--ib-bg-surface-secondary)",
                  border: "1px solid var(--ib-border)",
                  borderRadius: "14px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4F46E5, #06B6D4)",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  <FaShieldAlt size={18} />
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <div className="font-weight-bold" style={{ fontSize: "0.95rem" }}>
                    Administrator
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mt-0.5">
                    <span className="badge px-2 py-0.5 rounded-pill" style={{ background: "#4F46E5", color: "#FFF", fontSize: "0.68rem" }}>
                      Admin Operations
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              profile_data && (
                <div
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/student-profile");
                  }}
                  className="p-3 rounded-lg d-flex align-items-center gap-3"
                  style={{
                    background: "var(--ib-bg-surface-secondary)",
                    border: "1px solid var(--ib-border)",
                    cursor: "pointer",
                    borderRadius: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #E42313, #EA1B3D)",
                      color: "#FFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {profile_data.name ? profile_data.name.charAt(0).toUpperCase() : <FaUser size={16} />}
                  </div>

                  <div className="flex-grow-1 overflow-hidden">
                    <div className="font-weight-bold text-truncate" style={{ fontSize: "0.95rem" }}>
                      {profile_data.name}
                    </div>
                    <div className="d-flex align-items-center gap-1.5 mt-0.5">
                      <span className={isAlumni ? "badge-alumni" : "badge-student"} style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                        {isAlumni ? "Alumni" : "Student"}
                      </span>
                      <small className="text-muted" style={{ fontSize: "0.74rem" }}>
                        View Profile →
                      </small>
                    </div>
                  </div>
                </div>
              )
            )
          )}

          {/* Admin Dashboard Switcher in Drawer */}
          {isLoggedIn && isAdmin && (
            <NavLink
              to="/admin/dashboard"
              onClick={() => setDrawerOpen(false)}
              className="btn w-100 py-2.5 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-2 text-white text-decoration-none shadow-sm"
              style={{
                fontSize: "0.88rem",
                background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <FaShieldAlt size={14} color="#818CF8" />
              <span>Admin Operations Console</span>
            </NavLink>
          )}

          {/* Categories Section */}
          <div>
            <div className="text-muted font-weight-bold mb-2 px-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Filter by Category
            </div>
            <div className="d-flex flex-column gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className="btn w-100 text-left d-flex align-items-center gap-2.5 px-3 py-2 rounded-lg font-weight-bold"
                    style={{
                      fontSize: "0.86rem",
                      background: isSelected ? "rgba(228, 35, 19, 0.12)" : "transparent",
                      color: isSelected ? "#E42313" : "var(--ib-text-main)",
                      border: "1px solid",
                      borderColor: isSelected ? "rgba(228, 35, 19, 0.3)" : "transparent",
                      borderRadius: "10px",
                    }}
                  >
                    <Icon size={14} style={{ color: isSelected ? "#E42313" : "inherit" }} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions (For Alumni & Admin) */}
          {isLoggedIn && (
            <div className="pt-2 border-top d-flex flex-column gap-2">
              {(isAlumni || isAdmin) && (
                <button
                  onClick={handlePost}
                  className="btn-ib-primary w-100 py-2 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: "0.88rem" }}
                >
                  <FaPlus size={12} />
                  <span>Create New Post</span>
                </button>
              )}

              {isAlumni && (
                <NavLink
                  to="/my-posts"
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-outline-secondary w-100 py-2 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: "0.86rem", borderColor: "var(--ib-border)", color: "var(--ib-text-main)" }}
                >
                  <span>My Published Posts</span>
                </NavLink>
              )}
            </div>
          )}

          {/* Auth Section in Drawer */}
          <div className="mt-auto pt-3 border-top">
            {!isLoggedIn ? (
              <div className="d-flex flex-column gap-2.5">
                <NavLink
                  to="/signin"
                  onClick={() => setDrawerOpen(false)}
                  className="btn w-100 py-2.5 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    fontSize: "0.9rem",
                    border: "1.5px solid",
                    borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.45)" : "#E42313",
                    color: theme === "dark" ? "#FFFFFF" : "#E42313",
                    backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(228, 35, 19, 0.06)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FaSignInAlt size={14} style={{ color: theme === "dark" ? "#FFFFFF" : "#E42313" }} />
                  <span>Sign In</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setDrawerOpen(false)}
                  className="btn-ib-primary w-100 py-2.5 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  style={{ fontSize: "0.9rem" }}
                >
                  <FaUserPlus size={14} />
                  <span>Register Account</span>
                </NavLink>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="btn btn-outline-danger w-100 py-2.5 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-2"
                style={{ fontSize: "0.9rem", borderColor: "rgba(228, 35, 19, 0.5)", color: "#E42313" }}
              >
                <FaSignOutAlt size={13} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Navbar;