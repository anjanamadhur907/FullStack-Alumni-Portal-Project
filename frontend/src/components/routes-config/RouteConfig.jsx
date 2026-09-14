import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../home/Home";
import Signup from "../user/Signup";
import Signin from "../user/Signin";
import AdminDashboard from "../admin/AdminDashboard";
import AdminCreateStudent from "../admin/AdminCreateStudent";
import AdminCreateBatch from "../admin/AdminCreateBatch";
import AdminViewBatch from "../admin/AdminViewBatch";
import AdminViewStudent from "../admin/AdminViewStudent";
import Profile from "../profile/Profile";
import Auth from "../auth/Auth";
import Post from "../post/Post";
import MyPosts from "../post/MyPosts";
import ViewAllPosts from "../post/ViewAllPosts";

function RouteConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />

      {/* Protected Routes */}
      <Route
        path="/student-profile"
        element={
          <Auth>
            <Profile />
          </Auth>
        }
      />
      <Route
        path="/post"
        element={
          <Auth>
            <Post />
          </Auth>
        }
      />
      <Route
        path="/my-posts"
        element={
          <Auth>
            <MyPosts />
          </Auth>
        }
      />
      <Route
        path="/view-all-posts"
        element={
          <Auth>
            <ViewAllPosts />
          </Auth>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <Auth>
            <AdminDashboard />
          </Auth>
        }
      />
      <Route
        path="/admin/create-student"
        element={
          <Auth>
            <AdminCreateStudent />
          </Auth>
        }
      />
      <Route
        path="/admin/create-batch"
        element={
          <Auth>
            <AdminCreateBatch />
          </Auth>
        }
      />
      <Route
        path="/admin/view-batch"
        element={
          <Auth>
            <AdminViewBatch />
          </Auth>
        }
      />
      <Route
        path="/admin/view-students"
        element={
          <Auth>
            <AdminViewStudent />
          </Auth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RouteConfig;