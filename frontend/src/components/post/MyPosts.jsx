import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Navbar from "../nav/Nav";
import axiosInstance from "../axios-config/api";
import { NavLink } from "react-router-dom";
import { FaTrash, FaPlus, FaArrowLeft, FaLayerGroup } from "react-icons/fa";
import { toast } from "react-toastify";

function MyPosts() {
  const categoryRef = useRef();
  const { currentUser } = useSelector((store) => store.user);

  const [allPosts, setAllPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      getMyPosts();
    }
  }, [currentUser?.id]);

  const getMyPosts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/post/user/${currentUser.id}`);
      const data = res.data || [];
      setAllPosts(data);
      setPosts(data);
    } catch (err) {
      console.log(err);
      setAllPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPost = () => {
    const category = categoryRef.current?.value;
    if (!category || category === "all") {
      setPosts(allPosts);
      return;
    }
    const filtered = allPosts.filter((post) => post.category === category);
    setPosts(filtered);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axiosInstance.delete(`/post/${postId}`);
      toast.success("Post deleted successfully");
      getMyPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ib-bg)", color: "var(--ib-text-main)" }}>
      <Navbar />

      <div className="container py-4" style={{ maxWidth: "980px" }}>
        {/* Top Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <NavLink to="/" className="text-muted font-weight-bold d-inline-flex align-items-center gap-1.5 mb-1 text-decoration-none" style={{ fontSize: "0.82rem" }}>
              <FaArrowLeft size={11} /> Back to Feed
            </NavLink>
            <h2 className="brand-font font-weight-bold mb-0" style={{ fontSize: "1.6rem" }}>
              My Published Posts
            </h2>
          </div>

          <NavLink
            to="/post"
            className="btn-ib-primary btn-sm px-3.5 py-2 rounded-pill d-flex align-items-center gap-1.5"
            style={{ fontSize: "0.84rem" }}
          >
            <FaPlus size={11} />
            <span>New Post</span>
          </NavLink>
        </div>

        {/* Filter Bar */}
        <div className="ib-card p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "450px" }}>
            <select
              ref={categoryRef}
              className="form-control rounded-pill"
              defaultValue="all"
              style={{ fontSize: "0.85rem" }}
              onChange={searchPost}
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="Event">Event</option>
              <option value="Announcement">Announcement</option>
            </select>

            <button className="btn btn-sm btn-outline-danger px-3 rounded-pill" onClick={searchPost} style={{ fontSize: "0.82rem" }}>
              Filter
            </button>
          </div>

          <button className="btn btn-sm btn-ib-secondary px-3 rounded-pill" onClick={getMyPosts} style={{ fontSize: "0.82rem" }}>
            Refresh
          </button>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
          </div>
        ) : posts.length === 0 ? (
          <div className="ib-card p-5 text-center">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--ib-bg-surface-secondary)",
                color: "#E42313",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <FaLayerGroup size={22} />
            </div>
            <h5 className="font-weight-bold">No posts found</h5>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              You have not published any posts yet.
            </p>
            <NavLink to="/post" className="btn-ib-primary btn-sm px-4 py-2 rounded-pill mt-2">
              Create Your First Post
            </NavLink>
          </div>
        ) : (
          <div className="row">
            {posts.map((post) => {
              const imageUrl = post?.image
                ? post.image.startsWith("http")
                  ? post.image
                  : `${import.meta.env.VITE_API_URL}://${post.image}`
                : "";

              return (
                <div className="col-md-6 col-lg-4 mb-4" key={post.id}>
                  <div
                    className="ib-card h-100 d-flex flex-column justify-content-between"
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                    }}
                  >
                    {imageUrl && (
                      <div style={{ height: "180px", overflow: "hidden", background: "#1E2433" }}>
                        <img
                          src={imageUrl}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="p-3.5 flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge-category badge-category-general" style={{ fontSize: "0.68rem" }}>
                          {post.category || "General"}
                        </span>
                        <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                          {post.updated_at && new Date(post.updated_at).toLocaleDateString()}
                        </small>
                      </div>

                      <h5 className="brand-font mb-2 font-weight-bold" style={{ fontSize: "1rem", lineHeight: 1.35 }}>
                        {post.title}
                      </h5>

                      <p className="text-muted mb-0" style={{ fontSize: "0.82rem", lineHeight: 1.45, maxHeight: "68px", overflow: "hidden" }}>
                        {post.content}
                      </p>
                    </div>

                    <div className="p-3 border-top d-flex justify-content-end" style={{ background: "var(--ib-bg-surface-secondary)" }}>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="btn btn-sm btn-outline-danger px-3 py-1 rounded-pill d-flex align-items-center gap-1"
                        style={{ fontSize: "0.76rem" }}
                      >
                        <FaTrash size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPosts;
