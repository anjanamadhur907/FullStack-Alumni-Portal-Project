import { useEffect, useState } from "react";
import axiosInstance from "../axios-config/api";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, setCategoryFilter } from "../redux-config/UserSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaPlus,
  FaLayerGroup,
  FaInfoCircle,
  FaCalendarAlt,
  FaTimes,
  FaClock,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTrashAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaBullhorn,
} from "react-icons/fa";

function ViewAllPosts({ showTopBanner = true }) {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Date Filter & Sort States
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" (new to old) or "oldest" (old to new)

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
  const isStudent =
    isLoggedIn &&
    (profile_data?.role === "Student" || currentUser?.role === "Student") &&
    !isAlumni &&
    !isAdmin;
  const canPost = isAlumni || isAdmin;

  useEffect(() => {
    getAllPosts();
    if (!profile_data && currentUser?.token && !isAdmin) {
      loadProfile();
    }
  }, []);

  // Filter & sort posts whenever selectedCategory, dateFilter, customDate, or sortOrder changes
  useEffect(() => {
    let filtered = [...allPosts];

    // 1. Category Filter
    // When "General" (All Posts) is selected, show all posts (General, Event, Announcement).
    // If a specific category like "Event" or "Announcement" is selected, filter strictly by that category.
    const targetCat = selectedCategory || "General";
    if (targetCat.toLowerCase() !== "general" && targetCat.toLowerCase() !== "all") {
      filtered = filtered.filter((post) => {
        const pCat = post.category || "General";
        return pCat.toLowerCase() === targetCat.toLowerCase();
      });
    }

    // 2. Date Filter
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

    // 3. Date Sorting (Newest to Oldest or Oldest to Newest)
    filtered.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setPosts(filtered);
  }, [selectedCategory, dateFilter, customDate, sortOrder, allPosts]);

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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setDeletingId(postId);
    try {
      const token = currentUser?.token || localStorage.getItem("token");
      const headers = token ? { Authorization: "Bearer " + token } : {};
      await axiosInstance.delete(`/post/${postId}`, { headers });

      toast.success("Post deleted successfully");
      setAllPosts((prev) => prev.filter((p) => p.id !== postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
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

  return (
    <div className="w-100">
      {/* Role-Based Top Create Box for Alumni & Admin */}
      {showTopBanner && (
        canPost ? (
          <div
            className="ib-card p-4 mb-3.5 d-flex align-items-center justify-content-between flex-wrap gap-3"
            style={{
              borderRadius: "16px",
              border: isAdmin ? "1.5px solid rgba(79, 70, 229, 0.35)" : "1px solid var(--ib-border)",
              background: isAdmin ? "linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(6, 182, 212, 0.04) 100%)" : "var(--ib-bg-surface)",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  background: isAdmin ? "linear-gradient(135deg, #4F46E5, #06B6D4)" : "rgba(228, 35, 19, 0.12)",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: isAdmin ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none",
                }}
              >
                {isAdmin ? (
                  <FaShieldAlt size={19} />
                ) : profile_data?.name ? (
                  profile_data.name.charAt(0).toUpperCase()
                ) : (
                  <FaUser size={18} />
                )}
              </div>
              <div>
                <div className="font-weight-bold d-flex align-items-center gap-2" style={{ fontSize: "0.96rem" }}>
                  <span>
                    {isAdmin
                      ? "Admin Publisher: Share Official Announcement / Post"
                      : "Share an announcement, event, or referral"}
                  </span>
                  {isAdmin && (
                    <span
                      className="badge px-2 py-0.5 rounded-pill font-weight-bold"
                      style={{ background: "#4F46E5", color: "#FFF", fontSize: "0.68rem" }}
                    >
                      Official Admin
                    </span>
                  )}
                </div>
                <small className="text-muted" style={{ fontSize: "0.82rem" }}>
                  {isAdmin
                    ? "Posts by Administrator will be prominently highlighted to all members."
                    : "Post directly to all InfoBeans Foundation students and alumni."}
                </small>
              </div>
            </div>

            <button
              onClick={() => navigate("/post")}
              className="btn px-4 py-2 rounded-pill d-flex align-items-center gap-2 font-weight-bold text-white shadow-sm"
              style={{
                fontSize: "0.88rem",
                background: isAdmin
                  ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                  : "var(--ib-primary)",
                border: "none",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
              }}
            >
              <FaPlus size={11} />
              <span>Create Post</span>
            </button>
          </div>
        ) : isStudent ? (
          <div
            className="ib-card p-3 mb-3.5"
            style={{
              background: "rgba(0, 93, 166, 0.08)",
              borderColor: "rgba(0, 93, 166, 0.25)",
              borderRadius: "14px",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FaInfoCircle style={{ color: "#005DA6" }} size={18} />
              <div style={{ fontSize: "0.84rem", color: "var(--ib-text-main)", lineHeight: 1.4 }}>
                <strong>Student Mode:</strong> Browse updates and referrals posted by InfoBeans Foundation Alumni & Admins.
              </div>
            </div>
          </div>
        ) : null
      )}

      {/* Filter & Sort Control Bar */}
      <div
        className="ib-card p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2.5"
        style={{ borderRadius: "14px" }}
      >
        {/* Left: Date Filter Presets */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-1.5 text-muted font-weight-bold" style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>
            <FaCalendarAlt size={13} style={{ color: "#E42313" }} />
            <span>Date:</span>
          </div>

          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "this_week", label: "This Week" },
              { id: "this_month", label: "This Month" },
              { id: "custom", label: "Pick Date" },
            ].map((option) => {
              const isActive = dateFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDateFilter(option.id)}
                  className="btn btn-sm rounded-pill font-weight-bold"
                  style={{
                    fontSize: "0.78rem",
                    padding: "4px 12px",
                    background: isActive ? "#E42313" : "var(--ib-bg-surface-secondary)",
                    color: isActive ? "#FFF" : "var(--ib-text-main)",
                    border: "1px solid",
                    borderColor: isActive ? "#E42313" : "var(--ib-border)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Custom Date Picker, Sort Toggle & Post Counter */}
        <div className="d-flex align-items-center gap-2.5 flex-wrap ml-auto">
          {dateFilter === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="form-control form-control-sm rounded-pill"
              style={{
                fontSize: "0.8rem",
                width: "140px",
                height: "32px",
                padding: "2px 10px",
              }}
            />
          )}

          {dateFilter !== "all" && (
            <button
              onClick={clearDateFilter}
              className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1"
              style={{ fontSize: "0.75rem", padding: "3px 10px", borderColor: "var(--ib-border)" }}
              title="Reset date filter"
            >
              <FaTimes size={10} />
              <span>Reset</span>
            </button>
          )}

          {/* Sort Toggle Button (New to Old / Old to New) */}
          <div className="d-flex align-items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
              className="btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill font-weight-bold"
              style={{
                fontSize: "0.8rem",
                background: "var(--ib-bg-surface-secondary)",
                color: "var(--ib-text-main)",
                border: "1px solid var(--ib-border)",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
              title={`Sorting: ${sortOrder === "newest" ? "Newest First" : "Oldest First"} (Click to switch)`}
            >
              {sortOrder === "newest" ? (
                <>
                  <FaSortAmountDown size={12} color="#E42313" />
                  <span>New to Old</span>
                </>
              ) : (
                <>
                  <FaSortAmountUp size={12} color="#005DA6" />
                  <span>Old to New</span>
                </>
              )}
            </button>
          </div>

          <div className="text-muted font-weight-bold" style={{ fontSize: "0.78rem" }}>
            {posts.length} {posts.length === 1 ? "Post" : "Posts"}
          </div>
        </div>
      </div>

      {/* Direct Posts Stream */}
      {loading ? (
        <div className="ib-card p-5 text-center my-4">
          <div className="spinner-border text-danger mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }} />
          <div className="text-muted font-weight-bold" style={{ fontSize: "0.95rem" }}>
            Loading posts...
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="ib-card p-5 text-center my-4" style={{ borderRadius: "18px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(228, 35, 19, 0.1)",
              color: "#E42313",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <FaLayerGroup size={24} />
          </div>
          <h4 className="font-weight-bold mb-1">No posts found</h4>
          <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>
            {dateFilter !== "all"
              ? "No posts found for the selected date range. Try clearing the date filter."
              : "No posts available in this category. Check back soon!"}
          </p>

          <div className="d-flex justify-content-center gap-2 flex-wrap">
            {dateFilter !== "all" && (
              <button
                onClick={clearDateFilter}
                className="btn btn-outline-danger px-3.5 py-1.5 rounded-pill font-weight-bold"
                style={{ fontSize: "0.82rem", color: "#E42313", borderColor: "#E42313" }}
              >
                Clear Date Filter
              </button>
            )}

            {selectedCategory !== "General" && (
              <button
                onClick={() => dispatch(setCategoryFilter("General"))}
                className="btn btn-ib-primary px-3.5 py-1.5 rounded-pill font-weight-bold"
                style={{ fontSize: "0.82rem" }}
              >
                Show All Posts
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {posts.map((post) => {
            const isPostAdmin = post?.is_admin || post?.user_name === "Admin";

            const imageUrl = post?.image
              ? post.image.startsWith("http")
                ? post.image
                : `http://localhost:8000${post.image}`
              : "";

            const canDeleteThisPost = isAdmin || (currentUser?.id && post.user_id === currentUser.id);

            return (
              <article
                key={post.id}
                className="ib-card mb-4"
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: isPostAdmin
                    ? "2px solid rgba(79, 70, 229, 0.45)"
                    : "1px solid var(--ib-border)",
                  boxShadow: isPostAdmin
                    ? "0 10px 30px rgba(79, 70, 229, 0.16)"
                    : "0 2px 10px rgba(0,0,0,0.03)",
                  position: "relative",
                  transition: "all 0.25s ease",
                }}
              >
                {/* Special Top Accent Strip for Admin Posts */}
                {isPostAdmin && (
                  <div
                    style={{
                      height: "5px",
                      background: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 40%, #EC4899 80%, #06B6D4 100%)",
                    }}
                  />
                )}

                {/* Admin Highlight Banner Bar */}
                {isPostAdmin && (
                  <div
                    className="d-flex align-items-center justify-content-between px-4 py-2"
                    style={{
                      background: "linear-gradient(135deg, rgba(79, 70, 229, 0.14) 0%, rgba(124, 58, 237, 0.08) 100%)",
                      borderBottom: "1px solid rgba(79, 70, 229, 0.2)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2" style={{ color: "#4F46E5", fontWeight: 700, fontSize: "0.82rem" }}>
                      <FaBullhorn size={13} />
                      <span>OFFICIAL FOUNDATION ANNOUNCEMENT</span>
                    </div>

                    <span
                      className="badge px-2.5 py-1 rounded-pill font-weight-bold"
                      style={{
                        background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                        color: "#FFF",
                        fontSize: "0.7rem",
                        boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                      }}
                    >
                      ★ Admin Verified
                    </span>
                  </div>
                )}

                {/* Author Header */}
                <div
                  className="d-flex align-items-center justify-content-between px-4 pt-4 pb-2.5"
                  style={{
                    background: isPostAdmin
                      ? "linear-gradient(180deg, rgba(79, 70, 229, 0.04) 0%, transparent 100%)"
                      : "transparent",
                  }}
                >
                  <div className="d-flex align-items-center" style={{ gap: "16px" }}>
                    {/* Author Avatar */}
                    <div
                      style={{
                        width: isPostAdmin ? "52px" : "48px",
                        height: isPostAdmin ? "52px" : "48px",
                        borderRadius: "50%",
                        background: isPostAdmin
                          ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #06B6D4 100%)"
                          : "linear-gradient(135deg, #E42313, #EA1B3D)",
                        color: "#FFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isPostAdmin ? "22px" : "19px",
                        fontWeight: 700,
                        boxShadow: isPostAdmin
                          ? "0 4px 16px rgba(79, 70, 229, 0.45)"
                          : "0 3px 10px rgba(228, 35, 19, 0.28)",
                        border: isPostAdmin ? "2px solid #FFF" : "none",
                        flexShrink: 0,
                      }}
                    >
                      {isPostAdmin ? (
                        <FaShieldAlt size={22} />
                      ) : post.user_name ? (
                        post.user_name.charAt(0).toUpperCase()
                      ) : (
                        <FaUser size={18} />
                      )}
                    </div>

                    {/* Author Name & Batch */}
                    <div className="d-flex flex-column" style={{ gap: "4px" }}>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5
                          className="mb-0 font-weight-bold brand-font"
                          style={{
                            fontSize: isPostAdmin ? "1.15rem" : "1.08rem",
                            lineHeight: 1.25,
                            color: isPostAdmin ? "var(--ib-text-main)" : "inherit",
                          }}
                        >
                          {isPostAdmin ? "InfoBeans Foundation Administration" : (post.user_name || "Community Member")}
                        </h5>

                        {isPostAdmin && (
                          <span
                            className="d-inline-flex align-items-center gap-1 font-weight-bold"
                            style={{ color: "#4F46E5", fontSize: "0.82rem" }}
                            title="Verified Administrator"
                          >
                            <FaCheckCircle size={14} />
                          </span>
                        )}
                      </div>

                      <div
                        className="d-inline-flex align-items-center text-muted"
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                        }}
                      >
                        <span>
                          {isPostAdmin ? "Official Management Desk" : (post.user_batch || "Community Member")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header: Delete Action Button for Admin / Owner */}
                  {canDeleteThisPost && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5"
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        border: "1px solid rgba(228, 35, 19, 0.35)",
                        background: "rgba(228, 35, 19, 0.08)",
                        color: "#E42313",
                        transition: "all 0.15s ease",
                        cursor: "pointer",
                      }}
                      title={isAdmin ? "Delete this post as Administrator" : "Delete your post"}
                    >
                      <FaTrashAlt size={11} />
                      <span>{deletingId === post.id ? "Deleting..." : "Delete"}</span>
                    </button>
                  )}
                </div>

                {/* Post Title & Text */}
                <div className="px-4 pt-2 pb-3.5">
                  <h3
                    className="brand-font mb-2.5 font-weight-bold"
                    style={{
                      fontSize: isPostAdmin ? "1.28rem" : "1.2rem",
                      lineHeight: 1.4,
                      color: isPostAdmin ? "#4F46E5" : "inherit",
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    className="text-secondary mb-0"
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: 1.68,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {post.content}
                  </p>
                </div>

                {/* Post Image */}
                {imageUrl && (
                  <div
                    style={{
                      background: "#1E2433",
                      maxHeight: "520px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={post.title}
                      style={{ width: "100%", maxHeight: "520px", objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}

                {/* Post Footer with Bottom Corner Timestamp */}
                <div
                  className="d-flex align-items-center justify-content-between px-4 py-2.5 border-top"
                  style={{
                    background: isPostAdmin
                      ? "rgba(79, 70, 229, 0.03)"
                      : "transparent",
                  }}
                >
                  <span
                    className="badge rounded-pill px-3 py-1 font-weight-bold"
                    style={{
                      fontSize: "0.74rem",
                      background: isPostAdmin
                        ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
                        : "var(--ib-bg-surface-secondary)",
                      color: isPostAdmin ? "#FFF" : "var(--ib-text-main)",
                      border: isPostAdmin ? "none" : "1px solid var(--ib-border)",
                    }}
                  >
                    {post.category || "General"}
                  </span>

                  <div className="text-muted d-flex align-items-center gap-1.5" style={{ fontSize: "0.8rem" }}>
                    <FaClock size={11} style={{ opacity: 0.6 }} />
                    <span>
                      {post.updated_at
                        ? new Date(post.updated_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ViewAllPosts;