import { useEffect, useState } from "react";
import axiosInstance from "../axios-config/api";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, setCategoryFilter } from "../redux-config/UserSlice";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaPlus,
  FaLayerGroup,
  FaCalendarAlt,
  FaTimes,
  FaClock,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTrashAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaBullhorn,
  FaExpandAlt,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaBriefcase,
  FaTag,
  FaFilter,
  FaSlidersH,
  FaUndo,
  FaSearch,
} from "react-icons/fa";

function ViewAllPosts({ showTopBanner = true }) {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Search Params from URL (Navbar Search Integration)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlPostId = searchParams.get("postId") || "";

  // Selected post for Full Reader Modal
  const [activePost, setActivePost] = useState(null);

  // Filter Modal / Drawer State
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Date Filter & Sort States
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

  const { isLoggedIn, currentUser, profile_data, selectedCategory } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin =
    isLoggedIn &&
    (currentUser?.is_admin ||
      currentUser?.role === "Admin" ||
      profile_data?.role === "Admin" ||
      localStorage.getItem("is_admin") === "true" ||
      sessionStorage.getItem("admin_active") === "true");

  const isAlumni =
    isLoggedIn &&
    (profile_data?.role === "Alumni" || currentUser?.role === "Alumni");

  const canPost = isAlumni || isAdmin;

  useEffect(() => {
    getAllPosts();
    if (!profile_data && currentUser?.token && !isAdmin) {
      loadProfile();
    }
  }, []);

    // Auto-open post reader modal if ?postId=ID is present in URL
  useEffect(() => {
    if (urlPostId && allPosts.length > 0) {
      const found = allPosts.find((p) => String(p.id) === String(urlPostId));
      if (found) {
        setActivePost(found);
      }
    }
  }, [urlPostId, allPosts]);

  // Filter & sort posts whenever selectedCategory, dateFilter, customDate, sortOrder, or urlSearch changes
  useEffect(() => {
    let filtered = [...allPosts];

    // 1. Search Filter from URL
    if (urlSearch && urlSearch.trim()) {
      const q = urlSearch.trim().toLowerCase();
      filtered = filtered.filter((post) => {
        const matchTitle = post.title && post.title.toLowerCase().includes(q);
        const matchContent = post.content && post.content.toLowerCase().includes(q);
        const matchAuthor = post.user_name && post.user_name.toLowerCase().includes(q);
        const matchCategory = post.category && post.category.toLowerCase().includes(q);
        const matchBatch = post.user_batch && post.user_batch.toLowerCase().includes(q);
        return matchTitle || matchContent || matchAuthor || matchCategory || matchBatch;
      });
    }

    // 2. Category Filter
    const targetCat = selectedCategory || "General";
    if (targetCat.toLowerCase() !== "general" && targetCat.toLowerCase() !== "all") {
      filtered = filtered.filter((post) => {
        const pCat = post.category || "General";
        return pCat.toLowerCase() === targetCat.toLowerCase();
      });
    }

    // 3. Date Filter
    if (dateFilter !== "all") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        filtered = filtered.filter((post) => {
          if (!post.updated_at && !post.created_at) return false;
          const postDate = new Date(post.updated_at || post.created_at);
          return postDate >= startOfToday;
        });
      } else if (dateFilter === "this_week") {
        const weekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((post) => {
          if (!post.updated_at && !post.created_at) return false;
          const postDate = new Date(post.updated_at || post.created_at);
          return postDate >= weekAgo;
        });
      } else if (dateFilter === "this_month") {
        const monthAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((post) => {
          if (!post.updated_at && !post.created_at) return false;
          const postDate = new Date(post.updated_at || post.created_at);
          return postDate >= monthAgo;
        });
      } else if (dateFilter === "custom" && customDate) {
        filtered = filtered.filter((post) => {
          if (!post.updated_at && !post.created_at) return false;
          const raw = post.updated_at || post.created_at;
          const postDateStr = new Date(raw).toISOString().split("T")[0];
          return postDateStr === customDate;
        });
      }
    }

    // 4. Date Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setPosts(filtered);
  }, [selectedCategory, dateFilter, customDate, sortOrder, allPosts, urlSearch]);

  const loadProfile = async () => {
    try {
      const token = currentUser?.token;
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await axiosInstance.get("/profile/me", { headers });
      dispatch(getProfile(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const getAllPosts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/post/");
      const data = res.data || [];
      setAllPosts(data);
    } catch (err) {
      console.error(err);
      setAllPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setDeletingId(postId);
    try {
      const token = currentUser?.token || localStorage.getItem("token");
      const headers = token ? { Authorization: "Bearer " + token } : {};
      await axiosInstance.delete(`/post/${postId}`, { headers });

      toast.success("Post deleted successfully");
      setAllPosts((prev) => prev.filter((p) => p.id !== postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (activePost?.id === postId) setActivePost(null);
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error(err?.response?.data?.detail || "Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const clearDateFilter = () => {
    setDateFilter("all");
    setCustomDate("");
  };

  const clearAllFilters = () => {
    setDateFilter("all");
    setCustomDate("");
    dispatch(setCategoryFilter("General"));
  };

  const isDateFiltered = dateFilter !== "all" || customDate !== "";
  const isCategoryFiltered = selectedCategory && selectedCategory.toLowerCase() !== "general" && selectedCategory.toLowerCase() !== "all";
  const activeFilterCount = (isDateFiltered ? 1 : 0) + (isCategoryFiltered ? 1 : 0);

  const formatPostDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Helper for dynamic category badge styles
  const getCategoryBadge = (category = "General") => {
    const cat = category.toLowerCase();
    if (cat.includes("announc") || cat.includes("official")) {
      return {
        label: category,
        icon: <FaBullhorn size={11} />,
        bg: "rgba(79, 70, 229, 0.12)",
        color: "#4F46E5",
        border: "1px solid rgba(79, 70, 229, 0.28)",
      };
    }
    if (cat.includes("job") || cat.includes("career") || cat.includes("referral")) {
      return {
        label: category,
        icon: <FaBriefcase size={11} />,
        bg: "rgba(16, 185, 129, 0.12)",
        color: "#059669",
        border: "1px solid rgba(16, 185, 129, 0.28)",
      };
    }
    if (cat.includes("event") || cat.includes("meetup") || cat.includes("webinar")) {
      return {
        label: category,
        icon: <FaCalendarAlt size={11} />,
        bg: "rgba(245, 158, 11, 0.12)",
        color: "#D97706",
        border: "1px solid rgba(245, 158, 11, 0.28)",
      };
    }
    return {
      label: category,
      icon: <FaTag size={10} />,
      bg: "rgba(228, 35, 19, 0.09)",
      color: "var(--ib-primary, #E42313)",
      border: "1px solid rgba(228, 35, 19, 0.22)",
    };
  };

  const CATEGORY_OPTIONS = [
    { id: "General", label: "General", icon: FaTag },
    { id: "Announcement", label: "Announcement", icon: FaBullhorn },
    { id: "Event", label: "Event", icon: FaCalendarAlt },
    { id: "Jobs", label: "Jobs / Referral", icon: FaBriefcase },
    { id: "all", label: "All Categories", icon: FaLayerGroup },
  ];

  const DATE_OPTIONS = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "this_week", label: "This Week" },
    { id: "this_month", label: "This Month" },
    { id: "custom", label: "Specific Date" },
  ];

  return (
    <div className="w-100">
      {/* Top Create Button for Alumni & Admin */}
      {showTopBanner && canPost && (
        <div
          className="ib-card p-3 p-sm-3.5 mb-3.5 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3"
          style={{
            borderRadius: "16px",
            border: isAdmin ? "1.5px solid rgba(79, 70, 229, 0.35)" : "1px solid var(--ib-border)",
            background: isAdmin ? "linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(6, 182, 212, 0.04) 100%)" : "var(--ib-bg-surface)",
          }}
        >
          <div className="d-flex align-items-center gap-3 w-100 w-sm-auto">
            <div
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",
                borderRadius: "50%",
                background: isAdmin ? "linear-gradient(135deg, #4F46E5, #06B6D4)" : "rgba(228, 35, 19, 0.12)",
                color: isAdmin ? "#FFF" : "var(--ib-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {isAdmin ? <FaShieldAlt size={18} /> : profile_data?.name ? profile_data.name.charAt(0).toUpperCase() : <FaUser size={16} />}
            </div>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div className="font-weight-bold text-truncate" style={{ fontSize: "0.95rem", color: "var(--ib-text-main)" }}>
                {isAdmin ? "Publish Official Announcement" : "Publish a post, job referral, or event"}
              </div>
              <small className="text-muted d-block text-truncate" style={{ fontSize: "0.8rem" }}>
                Reach all InfoBeans Foundation scholars and graduates
              </small>
            </div>
          </div>

          <button
            onClick={() => navigate("/post")}
            className="btn btn-sm px-4 py-2 rounded-pill d-flex align-items-center justify-content-center gap-1.5 font-weight-bold text-white shadow-sm w-100 w-sm-auto"
            style={{
              fontSize: "0.85rem",
              background: isAdmin ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" : "var(--ib-primary, #E42313)",
              border: "none",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FaPlus size={11} />
            <span>Create Post</span>
          </button>
        </div>
      )}

      {/* Active Search Query Filter Banner */}
      {urlSearch && (
        <div
          className="d-flex align-items-center justify-content-between p-3 mb-3.5 shadow-sm"
          style={{
            background: "rgba(228, 35, 19, 0.08)",
            border: "1.5px solid rgba(228, 35, 19, 0.3)",
            borderRadius: "14px",
          }}
        >
          <div className="d-flex align-items-center gap-2.5 overflow-hidden">
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#E42313",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FaSearch size={13} />
            </div>
            <div className="overflow-hidden">
              <div className="font-weight-bold text-truncate" style={{ fontSize: "0.88rem", color: "var(--ib-text-main)" }}>
                Search results for: <span style={{ color: "#E42313" }}>"{urlSearch}"</span>
              </div>
              <small className="text-muted d-block text-truncate" style={{ fontSize: "0.75rem" }}>
                Showing {posts.length} matching {posts.length === 1 ? "post" : "posts"}
              </small>
            </div>
          </div>

          <button
            onClick={() => {
              searchParams.delete("search");
              setSearchParams(searchParams);
            }}
            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 font-weight-bold d-inline-flex align-items-center gap-1.5 flex-shrink-0"
            style={{ fontSize: "0.78rem" }}
          >
            <FaTimes size={10} />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. Compact & Responsive Feed Toolbar with Filter Trigger    */}
      {/* ============================================================ */}
      <div
        className="ib-card p-2.5 p-sm-3 mb-3.5 d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-sm"
        style={{ borderRadius: "14px", border: "1px solid var(--ib-border)", background: "var(--ib-bg-surface)" }}
      >
        {/* Left: Active Filter Indicators & Post Count */}
        <div className="d-flex align-items-center gap-2 flex-wrap" style={{ minWidth: 0 }}>
          <span
            className="badge px-2.5 py-1.5 rounded-pill font-weight-bold"
            style={{
              fontSize: "0.78rem",
              background: "var(--ib-bg-surface-secondary)",
              color: "var(--ib-text-main)",
              border: "1px solid var(--ib-border)",
            }}
          >
            {posts.length} {posts.length === 1 ? "Post" : "Posts"}
          </span>

          {/* Active Category Chip */}
          {isCategoryFiltered && (
            <span
              className="badge px-2.5 py-1.5 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
              style={{
                fontSize: "0.75rem",
                background: "rgba(228, 35, 19, 0.1)",
                color: "var(--ib-primary, #E42313)",
                border: "1px solid rgba(228, 35, 19, 0.25)",
              }}
            >
              <FaTag size={9} />
              <span>{selectedCategory}</span>
              <button
                type="button"
                onClick={() => dispatch(setCategoryFilter("General"))}
                style={{ background: "none", border: "none", color: "inherit", padding: 0, cursor: "pointer", display: "inline-flex" }}
                title="Remove category filter"
              >
                <FaTimes size={10} />
              </button>
            </span>
          )}

          {/* Active Date Chip */}
          {isDateFiltered && (
            <span
              className="badge px-2.5 py-1.5 rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
              style={{
                fontSize: "0.75rem",
                background: "rgba(0, 93, 166, 0.1)",
                color: "#005DA6",
                border: "1px solid rgba(0, 93, 166, 0.25)",
              }}
            >
              <FaCalendarAlt size={9} />
              <span>
                {dateFilter === "custom" && customDate
                  ? customDate
                  : dateFilter === "today"
                  ? "Today"
                  : dateFilter === "this_week"
                  ? "This Week"
                  : "This Month"}
              </span>
              <button
                type="button"
                onClick={clearDateFilter}
                style={{ background: "none", border: "none", color: "inherit", padding: 0, cursor: "pointer", display: "inline-flex" }}
                title="Remove date filter"
              >
                <FaTimes size={10} />
              </button>
            </span>
          )}
        </div>

        {/* Right: Filter Trigger Button & Quick Sort Toggle */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Main Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill font-weight-bold"
            style={{
              fontSize: "0.8rem",
              background: activeFilterCount > 0 ? "var(--ib-primary, #E42313)" : "var(--ib-bg-surface-secondary)",
              color: activeFilterCount > 0 ? "#FFF" : "var(--ib-text-main)",
              border: "1px solid",
              borderColor: activeFilterCount > 0 ? "var(--ib-primary, #E42313)" : "var(--ib-border)",
              boxShadow: activeFilterCount > 0 ? "0 2px 8px rgba(228, 35, 19, 0.28)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Open Filter & Sort Options"
          >
            <FaSlidersH size={12} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                className="badge rounded-circle bg-white text-danger d-inline-flex align-items-center justify-content-center"
                style={{ width: "16px", height: "16px", fontSize: "0.68rem", fontWeight: 800, padding: 0 }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Sort Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
            className="btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill font-weight-bold"
            style={{
              fontSize: "0.8rem",
              background: "var(--ib-bg-surface-secondary)",
              color: "var(--ib-text-main)",
              border: "1px solid var(--ib-border)",
              cursor: "pointer",
            }}
            title={`Sorting: ${sortOrder === "newest" ? "Newest First" : "Oldest First"}`}
          >
            {sortOrder === "newest" ? (
              <>
                <FaSortAmountDown size={11} color="#E42313" />
                <span className="d-none d-sm-inline">Newest</span>
              </>
            ) : (
              <>
                <FaSortAmountUp size={11} color="#005DA6" />
                <span className="d-none d-sm-inline">Oldest</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Interactive Filter & Sort Drawer / Modal                 */}
      {/* ============================================================ */}
      {showFilterModal && (
        <div
          className="modal fade show d-flex align-items-center justify-content-center p-2 p-sm-3"
          tabIndex="-1"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(10, 15, 29, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1055,
            overflowY: "auto",
          }}
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="modal-content border-0 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "520px",
              width: "100%",
              borderRadius: "22px",
              background: "var(--ib-bg-surface)",
              color: "var(--ib-text-main)",
              border: "1px solid var(--ib-border)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
              animation: "modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {/* Modal Header */}
            <div
              className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between"
              style={{ background: "var(--ib-bg-surface)", borderColor: "var(--ib-border)" }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(228, 35, 19, 0.12)",
                    color: "var(--ib-primary, #E42313)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaSlidersH size={15} />
                </div>
                <div>
                  <h5 className="brand-font font-weight-bold mb-0" style={{ fontSize: "1.05rem", color: "var(--ib-text-main)" }}>
                    Filter & Sort Feed
                  </h5>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Select categories, date ranges, or sort order
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center text-muted"
                onClick={() => setShowFilterModal(false)}
                style={{ width: "32px", height: "32px", padding: 0 }}
                title="Close filter"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4" style={{ maxHeight: "68vh", overflowY: "auto" }}>
              {/* Category Options */}
              <div className="mb-4">
                <label className="text-muted font-weight-bold mb-2 d-block" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                  Category
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = (selectedCategory || "General").toLowerCase() === cat.id.toLowerCase();
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => dispatch(setCategoryFilter(cat.id))}
                        className="btn btn-sm rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
                        style={{
                          fontSize: "0.8rem",
                          padding: "5px 14px",
                          background: isSelected ? "var(--ib-primary, #E42313)" : "var(--ib-bg-surface-secondary)",
                          color: isSelected ? "#FFF" : "var(--ib-text-main)",
                          border: "1px solid",
                          borderColor: isSelected ? "var(--ib-primary, #E42313)" : "var(--ib-border)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <CatIcon size={11} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Filter Options */}
              <div className="mb-4">
                <label className="text-muted font-weight-bold mb-2 d-block" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                  Date Published
                </label>
                <div className="d-flex flex-wrap gap-2 mb-2.5">
                  {DATE_OPTIONS.map((opt) => {
                    const isSelected = dateFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDateFilter(opt.id)}
                        className="btn btn-sm rounded-pill font-weight-bold d-inline-flex align-items-center gap-1.5"
                        style={{
                          fontSize: "0.8rem",
                          padding: "5px 14px",
                          background: isSelected ? "#005DA6" : "var(--ib-bg-surface-secondary)",
                          color: isSelected ? "#FFF" : "var(--ib-text-main)",
                          border: "1px solid",
                          borderColor: isSelected ? "#005DA6" : "var(--ib-border)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <FaCalendarAlt size={10} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Specific Date Picker Input */}
                {dateFilter === "custom" && (
                  <div className="mt-2 p-2.5 rounded-lg" style={{ background: "var(--ib-bg-surface-secondary)", border: "1px solid var(--ib-border)" }}>
                    <label className="text-muted font-weight-bold mb-1 d-block" style={{ fontSize: "0.74rem" }}>
                      Select Calendar Date:
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="form-control form-control-sm rounded-pill"
                      style={{ fontSize: "0.84rem", maxWidth: "200px" }}
                    />
                  </div>
                )}
              </div>

              {/* Sort Order Options */}
              <div className="mb-2">
                <label className="text-muted font-weight-bold mb-2 d-block" style={{ fontSize: "0.78rem", textTransform: "uppercase" }}>
                  Sort Feed By
                </label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSortOrder("newest")}
                    className="btn btn-sm rounded-pill font-weight-bold d-inline-flex align-items-center gap-2 flex-1"
                    style={{
                      fontSize: "0.82rem",
                      padding: "6px 16px",
                      background: sortOrder === "newest" ? "var(--ib-bg-surface-secondary)" : "transparent",
                      color: "var(--ib-text-main)",
                      border: "1.5px solid",
                      borderColor: sortOrder === "newest" ? "var(--ib-primary, #E42313)" : "var(--ib-border)",
                    }}
                  >
                    <FaSortAmountDown size={12} color="#E42313" />
                    <span>Newest First</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSortOrder("oldest")}
                    className="btn btn-sm rounded-pill font-weight-bold d-inline-flex align-items-center gap-2 flex-1"
                    style={{
                      fontSize: "0.82rem",
                      padding: "6px 16px",
                      background: sortOrder === "oldest" ? "var(--ib-bg-surface-secondary)" : "transparent",
                      color: "var(--ib-text-main)",
                      border: "1.5px solid",
                      borderColor: sortOrder === "oldest" ? "#005DA6" : "var(--ib-border)",
                    }}
                  >
                    <FaSortAmountUp size={12} color="#005DA6" />
                    <span>Oldest First</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="px-4 py-3 border-top d-flex align-items-center justify-content-between gap-2"
              style={{ background: "var(--ib-bg-surface-secondary)", borderColor: "var(--ib-border)" }}
            >
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 font-weight-bold d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: "0.8rem" }}
              >
                <FaUndo size={10} />
                <span>Reset All</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="btn btn-sm px-4 py-1.5 rounded-pill font-weight-bold text-white shadow-sm"
                style={{ fontSize: "0.82rem", background: "var(--ib-primary, #E42313)", border: "none" }}
              >
                Apply ({posts.length} {posts.length === 1 ? "Post" : "Posts"})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed Stream */}
      {loading ? (
        <div className="ib-card p-4 p-sm-5 text-center my-4">
          <div className="spinner-border text-danger mb-3" role="status" style={{ width: "2.2rem", height: "2.2rem" }} />
          <div className="text-muted font-weight-bold" style={{ fontSize: "0.92rem" }}>
            Loading community feed...
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="ib-card p-4 p-sm-5 text-center my-4" style={{ borderRadius: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(228, 35, 19, 0.1)",
              color: "#E42313",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <FaLayerGroup size={22} />
          </div>
          <h5 className="font-weight-bold mb-1" style={{ color: "var(--ib-text-main)" }}>
            No posts found
          </h5>
          <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
            {dateFilter !== "all"
              ? "No posts found for the selected date. Try resetting the date filter."
              : "No posts available in this category."}
          </p>
          {dateFilter !== "all" && (
            <button onClick={clearDateFilter} className="btn btn-outline-danger btn-sm px-3.5 py-1.5 rounded-pill font-weight-bold">
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {posts.map((post) => {
            const isPostAdmin = post?.is_admin || post?.user_name === "Admin";
            const imageUrl = post?.image
              ? post.image.startsWith("http")
                ? post.image
                : `${import.meta.env.VITE_API_URL}${post.image}`
              : "";

            const canDeleteThisPost = isAdmin || (currentUser?.id && post.user_id === currentUser.id);
            const catBadge = getCategoryBadge(post.category);

            return (
              <article
                key={post.id}
                className="ib-card"
                onClick={() => setActivePost(post)}
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: isPostAdmin
                    ? "1.5px solid rgba(79, 70, 229, 0.4)"
                    : "1px solid var(--ib-border)",
                  boxShadow: isPostAdmin
                    ? "0 8px 24px rgba(79, 70, 229, 0.12)"
                    : "0 2px 10px rgba(0,0,0,0.03)",
                  position: "relative",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease",
                  cursor: "pointer",
                  background: "var(--ib-bg-surface)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = isPostAdmin
                    ? "0 12px 30px rgba(79, 70, 229, 0.2)"
                    : "0 8px 22px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isPostAdmin
                    ? "0 8px 24px rgba(79, 70, 229, 0.12)"
                    : "0 2px 10px rgba(0,0,0,0.03)";
                }}
              >
                {/* Admin Highlight Banner */}
                {isPostAdmin && (
                  <div
                    className="d-flex align-items-center justify-content-between px-3 px-sm-3.5 py-1.5"
                    style={{
                      background: "linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)",
                      borderBottom: "1px solid rgba(79, 70, 229, 0.18)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-1.5" style={{ color: "#4F46E5", fontWeight: 700, fontSize: "0.74rem" }}>
                      <FaBullhorn size={11} />
                      <span>OFFICIAL ANNOUNCEMENT</span>
                    </div>
                    <span className="badge bg-primary px-2 py-0.5 rounded-pill font-weight-bold" style={{ fontSize: "0.65rem" }}>
                      Verified Admin
                    </span>
                  </div>
                )}

                {/* Author Info Bar */}
                <div className="p-3 p-sm-3.5 p-md-4 pb-2 d-flex align-items-center justify-content-between gap-2">
                  <Link
                    to={post.user_id ? `/profile/${post.user_id}` : "#"}
                    onClick={(e) => e.stopPropagation()}
                    className="d-flex align-items-center text-decoration-none text-reset"
                    style={{ gap: "10px", minWidth: 0, flex: 1, overflow: "hidden" }}
                    title={`View ${post.user_name || "Author"}'s profile & posts`}
                  >
                    {/* Author Avatar */}
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        minWidth: "42px",
                        borderRadius: "50%",
                        background: isPostAdmin
                          ? "linear-gradient(135deg, #4F46E5, #06B6D4)"
                          : "linear-gradient(135deg, #E42313, #EA1B3D)",
                        color: "#FFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "17px",
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {isPostAdmin ? (
                        <FaShieldAlt size={16} />
                      ) : post.user_name ? (
                        post.user_name.charAt(0).toUpperCase()
                      ) : (
                        <FaUser size={15} />
                      )}
                    </div>

                    {/* Author Name, Batch, and Role */}
                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <div className="d-flex align-items-center gap-1.5 flex-wrap">
                        <span className="brand-font font-weight-bold text-truncate" style={{ fontSize: "0.95rem", lineHeight: 1.25, color: "var(--ib-text-main)", maxWidth: "180px" }}>
                          {isPostAdmin ? "InfoBeans Administration" : (post.user_name || "Community Member")}
                        </span>
                        {isPostAdmin && (
                          <FaCheckCircle size={12} style={{ color: "#4F46E5" }} title="Verified Admin" />
                        )}
                        <span
                          className={`badge rounded-pill px-2 py-0.5 font-weight-bold ${
                            isPostAdmin ? "bg-primary text-white" : "badge-alumni"
                          }`}
                          style={{ fontSize: "0.65rem" }}
                        >
                          {isPostAdmin ? "Admin" : "Alumni"}
                        </span>
                      </div>

                      <div className="text-muted d-flex align-items-center gap-1.5 mt-0.5" style={{ fontSize: "0.76rem" }}>
                        <span className="text-truncate" style={{ maxWidth: "120px" }}>
                          {isPostAdmin ? "Official Desk" : (post.user_batch || "Cohort")}
                        </span>
                        <span>•</span>
                        <span className="d-inline-flex align-items-center gap-1 text-nowrap">
                          <FaClock size={9} />
                          {formatPostDate(post.updated_at || post.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Actions (Delete if permitted) */}
                  {canDeleteThisPost && (
                    <div className="d-flex align-items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDeletePost(post.id, e)}
                        disabled={deletingId === post.id}
                        className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px", padding: 0 }}
                        title="Delete post"
                      >
                        <FaTrashAlt size={11} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Title & Content Preview */}
                <div className="px-3 px-sm-3.5 px-md-4 pt-1 pb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span
                      className="d-inline-flex align-items-center gap-1.5 rounded-pill font-weight-bold"
                      style={{
                        fontSize: "0.72rem",
                        padding: "3px 10px",
                        background: catBadge.bg,
                        color: catBadge.color,
                        border: catBadge.border,
                      }}
                    >
                      {catBadge.icon}
                      <span>{catBadge.label}</span>
                    </span>
                  </div>

                  <h4 className="brand-font font-weight-bold mb-2 text-break-all" style={{ fontSize: "1.1rem", lineHeight: 1.35, color: "var(--ib-text-main)" }}>
                    {post.title}
                  </h4>

                  {post.content && (
                    <p
                      className="mb-0 text-break-all"
                      style={{
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        color: "var(--ib-text-muted)",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {post.content}
                    </p>
                  )}
                </div>

                {/* Post Image Preview */}
                {imageUrl && (
                  <div
                    style={{
                      background: "var(--ib-bg-surface-secondary)",
                      maxHeight: "360px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTop: "1px solid var(--ib-border)",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={post.title}
                      style={{ width: "100%", maxHeight: "360px", objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}

                {/* Post Card Footer */}
                <div
                  className="px-3 px-sm-3.5 px-md-4 py-2.5 border-top d-flex align-items-center justify-content-between"
                  style={{ background: "var(--ib-bg-surface-secondary)", fontSize: "0.8rem" }}
                >
                  <span className="text-muted d-inline-flex align-items-center gap-1.5">
                    <FaExpandAlt size={10} /> Click to open
                  </span>
                  <span className="font-weight-bold d-inline-flex align-items-center gap-1" style={{ color: "var(--ib-primary, #E42313)" }}>
                    <span>Read Details</span>
                    <span>→</span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* Interactive Full Post Reader Modal / Popup Card             */}
      {/* ============================================================ */}
      {activePost && (
        <div
          className="modal fade show d-flex align-items-center justify-content-center p-2 p-sm-3"
          tabIndex="-1"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(10, 15, 29, 0.78)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 1060,
            overflowY: "auto",
          }}
          onClick={() => setActivePost(null)}
        >
          <div
            className="modal-content border-0 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "760px",
              width: "100%",
              maxHeight: "92vh",
              borderRadius: "20px",
              background: "var(--ib-bg-surface)",
              color: "var(--ib-text-main)",
              border: "1px solid var(--ib-border)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
              animation: "modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              className="px-3 px-sm-4 py-3 border-bottom d-flex align-items-center justify-content-between gap-2"
              style={{
                background: (activePost.is_admin || activePost.user_name === "Admin")
                  ? "linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)"
                  : "var(--ib-bg-surface)",
                borderColor: "var(--ib-border)",
                flexShrink: 0,
              }}
            >
              <Link
                to={activePost.user_id ? `/profile/${activePost.user_id}` : "#"}
                onClick={() => setActivePost(null)}
                className="d-flex align-items-center text-decoration-none text-reset"
                style={{ gap: "10px", minWidth: 0, flex: 1, overflow: "hidden" }}
                title={`View ${activePost.user_name || "Author"}'s profile`}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    minWidth: "42px",
                    borderRadius: "50%",
                    background: (activePost.is_admin || activePost.user_name === "Admin")
                      ? "linear-gradient(135deg, #4F46E5, #06B6D4)"
                      : "linear-gradient(135deg, #E42313, #EA1B3D)",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "17px",
                    flexShrink: 0,
                    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
                  }}
                >
                  {(activePost.is_admin || activePost.user_name === "Admin") ? (
                    <FaShieldAlt size={18} />
                  ) : activePost.user_name ? (
                    activePost.user_name.charAt(0).toUpperCase()
                  ) : (
                    <FaUser size={16} />
                  )}
                </div>
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div className="d-flex align-items-center gap-1.5 flex-wrap">
                    <span className="font-weight-bold brand-font text-truncate" style={{ fontSize: "0.98rem", color: "var(--ib-text-main)", maxWidth: "180px" }}>
                      {activePost.is_admin ? "InfoBeans Administration" : (activePost.user_name || "Community Member")}
                    </span>
                    {activePost.is_admin && (
                      <FaCheckCircle size={12} style={{ color: "#4F46E5" }} title="Verified Admin" />
                    )}
                    <span
                      className={`badge rounded-pill px-2 py-0.5 font-weight-bold ${
                        activePost.is_admin ? "bg-primary text-white" : "badge-alumni"
                      }`}
                      style={{ fontSize: "0.68rem" }}
                    >
                      {activePost.is_admin ? "Admin" : "Alumni"}
                    </span>
                  </div>
                  <div className="text-muted d-flex align-items-center gap-1.5 mt-0.5" style={{ fontSize: "0.76rem" }}>
                    <span className="text-truncate" style={{ maxWidth: "120px" }}>
                      {activePost.is_admin ? "Official Desk" : (activePost.user_batch || "Cohort")}
                    </span>
                    <span>•</span>
                    <span className="d-inline-flex align-items-center gap-1 text-nowrap">
                      <FaClock size={9} />
                      {formatPostDate(activePost.updated_at || activePost.created_at)}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Header Right Actions */}
              <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center text-muted"
                  onClick={() => setActivePost(null)}
                  style={{ width: "32px", height: "32px", padding: 0 }}
                  title="Close popup"
                >
                  <FaTimes size={13} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-3 p-sm-4" style={{ overflowY: "auto", flex: 1 }}>
              {/* Category Pill */}
              {(() => {
                const catInfo = getCategoryBadge(activePost.category);
                return (
                  <div className="mb-2.5">
                    <span
                      className="d-inline-flex align-items-center gap-1.5 rounded-pill font-weight-bold"
                      style={{
                        fontSize: "0.74rem",
                        padding: "3px 11px",
                        background: catInfo.bg,
                        color: catInfo.color,
                        border: catInfo.border,
                      }}
                    >
                      {catInfo.icon}
                      <span>{catInfo.label}</span>
                    </span>
                  </div>
                );
              })()}

              {/* Title */}
              <h2
                className="brand-font font-weight-bold mb-3 text-break-all"
                style={{
                  fontSize: "1.28rem",
                  lineHeight: 1.35,
                  color: "var(--ib-text-main)",
                  letterSpacing: "-0.01em",
                }}
              >
                {activePost.title}
              </h2>

              {/* Full Text Content */}
              {activePost.content && (
                <div
                  className="mb-3.5 text-break-all"
                  style={{
                    fontSize: "0.96rem",
                    lineHeight: 1.75,
                    color: "var(--ib-text-main)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {activePost.content}
                </div>
              )}

              {/* High-Res Image Display */}
              {activePost.image && (
                <div
                  className="overflow-hidden my-3"
                  style={{
                    background: "var(--ib-bg-surface-secondary)",
                    borderRadius: "14px",
                    border: "1px solid var(--ib-border)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={
                      activePost.image.startsWith("http")
                        ? activePost.image
                        : `${import.meta.env.VITE_API_URL}${activePost.image}`
                    }
                    alt={activePost.title}
                    style={{
                      width: "100%",
                      maxHeight: "440px",
                      objectFit: "contain",
                      display: "block",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="px-3 px-sm-4 py-2.5 border-top d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2"
              style={{ background: "var(--ib-bg-surface-secondary)", borderColor: "var(--ib-border)", flexShrink: 0 }}
            >
              <Link
                to={activePost.user_id ? `/profile/${activePost.user_id}` : "#"}
                onClick={() => setActivePost(null)}
                className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 font-weight-bold d-inline-flex align-items-center justify-content-center gap-1.5 w-100 w-sm-auto"
                style={{ fontSize: "0.8rem" }}
              >
                <FaGraduationCap size={12} />
                <span>View Author Profile & Posts</span>
                <FaExternalLinkAlt size={9} />
              </Link>

              <div className="d-flex align-items-center justify-content-end gap-2">
                {(isAdmin || (currentUser?.id && activePost.user_id === currentUser.id)) && (
                  <button
                    onClick={(e) => handleDeletePost(activePost.id, e)}
                    disabled={deletingId === activePost.id}
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 font-weight-bold d-inline-flex align-items-center gap-1"
                    style={{ fontSize: "0.78rem" }}
                  >
                    <FaTrashAlt size={10} />
                    <span>{deletingId === activePost.id ? "Deleting..." : "Delete"}</span>
                  </button>
                )}

                <button
                  onClick={() => setActivePost(null)}
                  className="btn btn-sm btn-secondary rounded-pill px-3.5 py-1.5 font-weight-bold"
                  style={{ fontSize: "0.8rem" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAllPosts;