import { createSlice } from "@reduxjs/toolkit";

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getSavedProfile = () => {
  try {
    const saved = localStorage.getItem("profile_data");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const savedUser = getSavedUser();
const savedProfile = getSavedProfile();

const slice = createSlice({
  name: "UserSlice",
  initialState: {
    currentUser: savedUser,
    isLoggedIn: !!savedUser,
    profile_data: savedProfile,
    selectedCategory: "General",
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
      try {
        localStorage.setItem("currentUser", JSON.stringify(action.payload));
      } catch (err) {
        console.error(err);
      }
    },
    signOut: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.profile_data = null;
      try {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("profile_data");
        localStorage.removeItem("is_admin");
        sessionStorage.removeItem("admin_active");
      } catch (err) {
        console.error(err);
      }
    },
    getProfile: (state, action) => {
      state.profile_data = action.payload;
      try {
        localStorage.setItem("profile_data", JSON.stringify(action.payload));
      } catch (err) {
        console.error(err);
      }
    },
    setCategoryFilter: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setUser, signOut, getProfile, setCategoryFilter } = slice.actions;
export default slice.reducer;