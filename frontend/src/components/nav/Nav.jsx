import { useEffect, useState, useRef } from "react";
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
  FaSearch,
  FaNewspaper,
  FaArrowRight,
  FaSpinner,
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

  // Search Spotlight Modal States
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTab, setSearchTab] = useState("all"); // "all" | "people" | "posts"
  const [searchResults, setSearchResults] = useState({ profiles: [], posts: [] });

  const searchInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

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

  // Close drawer and search modal on route change
  useEffect(() => {
    setDrawerOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname, location.search]);

  // Global Ctrl+K / Cmd+K shortcut to open search modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when search modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      if (!drawerOpen) {
        document.body.style.overflow = "unset";
      }
    }
    return () => {
      if (!drawerOpen) {
        document.body.style.overflow = "unset";
      }
    };
  }, [searchModalOpen, drawerOpen]);

  // Disable body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else if (!searchModalOpen) {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen, searchModalOpen]);

  // Throttled Scroll Listener using requestAnimationFrame for optimal 60fps performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > 30) {
            setIsScrolled(true);
          } else {
            setIsScrolled(false);
          }

          // Hide when scrolling down, show when scrolling up
          if (currentScrollY > lastScrollY && currentScrollY > 80 && !drawerOpen && !searchModalOpen) {
            setVisible(false);
          } else {
            setVisible(true);
          }

          lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [drawerOpen, searchModalOpen]);

  // Real-time Debounced Search Function
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults({ profiles: [], posts: [] });
      setIsSearching(false);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const token = currentUser?.token || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch Profiles from Search API
        const profilePromise = axiosInstance
          .get(`/profile/search?q=${encodeURIComponent(q)}`, { headers })
          .then((res) => res.data || [])
          .catch(() => []);

        // 2. Fetch Posts & Filter locally for instant matching
        const postsPromise = axiosInstance
          .get("/post/", { headers })
          .then((res) => res.data || [])
          .catch(() => []);

        const [profilesData, rawPosts] = await Promise.all([profilePromise, postsPromise]);

        const lowerQ = q.toLowerCase();

        // Filter Posts
        const matchedPosts = rawPosts.filter((p) => {
          const matchTitle = p.title && p.title.toLowerCase().includes(lowerQ);
          const matchContent = p.content && p.content.toLowerCase().includes(lowerQ);
          const matchAuthor = p.user_name && p.user_name.toLowerCase().includes(lowerQ);
          const matchCat = p.category && p.category.toLowerCase().includes(lowerQ);
          const matchBatch = p.user_batch && p.user_batch.toLowerCase().includes(lowerQ);
          return matchTitle || matchContent || matchAuthor || matchCat || matchBatch;
        });

        // Merge profiles with unique matched authors from posts for 100% search coverage
        const profileMap = new Map();
        (profilesData || []).forEach((p) => {
          if (p && p.user_id) profileMap.set(String(p.user_id), p);
        });

        // Add matching authors from posts if not already present
        rawPosts.forEach((p) => {
          if (p.user_name && p.user_name.toLowerCase().includes(lowerQ)) {
            const uid = String(p.user_id || `post-author-${p.user_name}`);
            if (!profileMap.has(uid)) {
              profileMap.set(uid, {
                user_id: p.user_id,
                name: p.user_name,
                role: p.is_admin ? "Admin" : "Alumni",
                batch_name: p.user_batch || "Community Author",
                about: `Author of post "${p.title}"`,
              });
            }
          }
        });

        const combinedProfiles = Array.from(profileMap.values());

        setSearchResults({
          profiles: combinedProfiles.slice(0, 6),
          posts: matchedPosts.slice(0, 6),
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

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

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setSearchModalOpen(false);
    navigate(`/?search=${encodeURIComponent(q)}`);
  };

  const handleSelectProfile = (userId) => {
    setSearchModalOpen(false);
    setSearchQuery("");
    if (currentUser?.id === userId) {
      navigate("/student-profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const handleSelectPost = (postId) => {
    setSearchModalOpen(false);
    setSearchQuery("");
    navigate(`/?postId=${postId}`);
  };

  const totalResults = searchResults.profiles.length + searchResults.posts.length;

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

            {/* Desktop Search Trigger Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="d-none d-lg-flex align-items-center gap-2 px-3 py-1.5 rounded-pill font-weight-bold mr-3"
              style={{
                fontSize: "0.82rem",
                background: "var(--ib-bg-surface-secondary)",
                color: "var(--ib-text-main)",
                border: "1.5px solid var(--ib-border)",
                cursor: "pointer",
                transition: "all 0.18s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#E42313";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(228, 35, 19, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--ib-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="Search people and posts (Ctrl+K)"
            >
              <FaSearch size={12} color="#E42313" />
              <span style={{ opacity: 0.85 }}>Search...</span>
              <span
                className="badge px-1.5 py-0.5 ml-1 font-weight-bold"
                style={{
                  fontSize: "0.62rem",
                  background: "var(--ib-border)",
                  color: "var(--ib-text-muted)",
                  borderRadius: "4px",
                }}
              >
                Ctrl+K
              </span>
            </button>

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

            {/* Mobile Header Right Controls (Search Button + Theme + Side Drawer Trigger) */}
            <div className="d-flex d-lg-none align-items-center gap-2">
              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--ib-bg-surface-secondary)",
                  border: "1px solid var(--ib-border)",
                  color: "#E42313",
                  cursor: "pointer",
                  padding: 0,
                }}
                aria-label="Search"
                title="Search (Ctrl+K)"
              >
                <FaSearch size={13} />
              </button>

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
      {/* Spotlight Search Modal (Opens on Button / Ctrl+K click)    */}
      {/* ========================================================= */}
      {searchModalOpen && (
        <div
          onClick={() => setSearchModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(8px)",
            zIndex: 2050,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "60px 16px 20px 16px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ib-card overflow-hidden d-flex flex-column"
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "80vh",
              backgroundColor: "var(--ib-bg-surface)",
              borderRadius: "20px",
              border: "1px solid var(--ib-border)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
            }}
          >
            {/* Search Input Bar in Modal */}
            <form onSubmit={handleSearchSubmit} className="d-flex align-items-center p-3 px-3.5 border-bottom gap-2.5">
              <FaSearch size={16} style={{ color: "#E42313", flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alumni, students, posts by name, topic..."
                className="border-0 bg-transparent flex-grow-1"
                style={{
                  outline: "none",
                  fontSize: "1rem",
                  color: "var(--ib-text-main)",
                  fontWeight: 500,
                }}
              />
              {isSearching && <FaSpinner size={13} className="text-muted fa-spin mr-1" />}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults({ profiles: [], posts: [] });
                  }}
                  className="btn p-0 border-0 text-muted d-flex align-items-center justify-content-center"
                  style={{ width: "22px", height: "22px" }}
                >
                  <FaTimes size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-0.5"
                style={{ fontSize: "0.72rem" }}
              >
                ESC
              </button>
            </form>

            {/* Filter Tabs if results exist */}
            {searchQuery.trim() && (
              <div className="px-3.5 py-2 d-flex align-items-center gap-1.5 border-bottom bg-surface-secondary">
                <button
                  type="button"
                  onClick={() => setSearchTab("all")}
                  className={`ib-search-tab ${searchTab === "all" ? "active" : ""}`}
                >
                  All ({totalResults})
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab("people")}
                  className={`ib-search-tab ${searchTab === "people" ? "active" : ""}`}
                >
                  People ({searchResults.profiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab("posts")}
                  className={`ib-search-tab ${searchTab === "posts" ? "active" : ""}`}
                >
                  Posts ({searchResults.posts.length})
                </button>
              </div>
            )}

            {/* Results Body */}
            <div className="p-3 overflow-y-auto flex-grow-1" style={{ maxHeight: "380px" }}>
              {!searchQuery.trim() ? (
                <div className="py-4 text-center text-muted">
                  <FaSearch size={24} style={{ color: "var(--ib-border)" }} className="mb-2" />
                  <div className="font-weight-bold" style={{ fontSize: "0.88rem", color: "var(--ib-text-main)" }}>
                    Search InfoBeans Community
                  </div>
                  <small className="text-muted d-block mt-0.5" style={{ fontSize: "0.78rem" }}>
                    Type a name (e.g. <em>"Madhur"</em>, <em>"Yash"</em>) or post keyword
                  </small>
                </div>
              ) : totalResults === 0 && !isSearching ? (
                <div className="py-4 text-center">
                  <div className="text-muted mb-1" style={{ fontSize: "1.4rem" }}>
                    🔍
                  </div>
                  <div className="font-weight-bold" style={{ fontSize: "0.88rem", color: "var(--ib-text-main)" }}>
                    No matches found for "{searchQuery}"
                  </div>
                  <small className="text-muted" style={{ fontSize: "0.76rem" }}>
                    Try searching with another person's name, role, or post topic
                  </small>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {/* Section 1: People & Alumni */}
                  {(searchTab === "all" || searchTab === "people") && searchResults.profiles.length > 0 && (
                    <div>
                      <div
                        className="px-2 py-1 text-muted font-weight-bold text-uppercase"
                        style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}
                      >
                        People & Alumni
                      </div>

                      {searchResults.profiles.map((profile) => {
                        const isUserAlumni = profile.role === "Alumni";
                        const isAdminUser = profile.role === "Admin";
                        return (
                          <div
                            key={`profile-${profile.user_id}`}
                            onClick={() => handleSelectProfile(profile.user_id)}
                            className="ib-search-item"
                          >
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                background: isAdminUser
                                  ? "linear-gradient(135deg, #4F46E5, #06B6D4)"
                                  : isUserAlumni
                                  ? "linear-gradient(135deg, #005DA6, #0284C7)"
                                  : "linear-gradient(135deg, #E42313, #EA1B3D)",
                                color: "#FFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {isAdminUser ? (
                                <FaShieldAlt size={13} />
                              ) : profile.name ? (
                                profile.name.charAt(0).toUpperCase()
                              ) : (
                                <FaUser size={12} />
                              )}
                            </div>

                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex align-items-center gap-1.5">
                                <span
                                  className="font-weight-bold text-truncate"
                                  style={{ fontSize: "0.88rem", color: "var(--ib-text-main)" }}
                                >
                                  {profile.name}
                                </span>
                                <span
                                  className={
                                    isAdminUser
                                      ? "badge badge-primary px-1.5 py-0.5"
                                      : isUserAlumni
                                      ? "badge-alumni"
                                      : "badge-student"
                                  }
                                  style={{ fontSize: "0.62rem", padding: "1px 6px" }}
                                >
                                  {profile.role || "Member"}
                                </span>
                              </div>
                              <small className="text-muted d-block text-truncate" style={{ fontSize: "0.74rem" }}>
                                {profile.batch_name ? `${profile.batch_name}` : profile.about || "InfoBeans Community"}
                              </small>
                            </div>

                            <FaArrowRight size={11} className="text-muted" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Section 2: Posts */}
                  {(searchTab === "all" || searchTab === "posts") && searchResults.posts.length > 0 && (
                    <div className={searchResults.profiles.length > 0 && searchTab === "all" ? "mt-2 pt-2 border-top" : ""}>
                      <div
                        className="px-2 py-1 text-muted font-weight-bold text-uppercase"
                        style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}
                      >
                        Posts & Discussions
                      </div>

                      {searchResults.posts.map((post) => (
                        <div
                          key={`post-${post.id}`}
                          onClick={() => handleSelectPost(post.id)}
                          className="ib-search-item"
                        >
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              background: "rgba(228, 35, 19, 0.1)",
                              color: "#E42313",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <FaNewspaper size={15} />
                          </div>

                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center gap-1.5">
                              <span
                                className="font-weight-bold text-truncate"
                                style={{ fontSize: "0.86rem", color: "var(--ib-text-main)" }}
                              >
                                {post.title}
                              </span>
                              <span
                                className="badge px-1.5 py-0.5 rounded-pill"
                                style={{
                                  fontSize: "0.62rem",
                                  background: "var(--ib-bg-surface-secondary)",
                                  color: "var(--ib-text-muted)",
                                  border: "1px solid var(--ib-border)",
                                }}
                              >
                                {post.category || "General"}
                              </span>
                            </div>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "0.74rem" }}>
                              by {post.user_name || "Community Member"}
                            </small>
                          </div>

                          <FaArrowRight size={11} className="text-muted" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Action */}
            {searchQuery.trim() && (
              <div className="p-3 border-top bg-surface-secondary">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="btn w-100 py-2 rounded-pill font-weight-bold d-flex align-items-center justify-content-center gap-1.5"
                  style={{
                    fontSize: "0.82rem",
                    background: "rgba(228, 35, 19, 0.08)",
                    color: "#E42313",
                    border: "1px solid rgba(228, 35, 19, 0.25)",
                  }}
                >
                  <FaSearch size={11} />
                  <span>See all results for "{searchQuery}" in Feed</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
          {/* Quick Search Button in Drawer */}
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              setSearchModalOpen(true);
            }}
            className="btn w-100 text-left d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-lg font-weight-bold"
            style={{
              fontSize: "0.88rem",
              background: "var(--ib-bg-surface-secondary)",
              color: "var(--ib-text-main)",
              border: "1px solid var(--ib-border)",
              borderRadius: "12px",
            }}
          >
            <FaSearch size={13} style={{ color: "#E42313" }} />
            <span>Search People & Posts</span>
          </button>

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