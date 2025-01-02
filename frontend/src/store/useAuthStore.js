import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIng: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({authUser: res.data});
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth frontend controller->", error);
      set({authUser: null});
    } finally {
      set({isCheckingAuth: false});
    }
  },
  signup: async (data) => {
    try {
      set({isSigningUp: true});
      const res = await axiosInstance.post("/auth/signup", data);
      set({authUser: res.data});
      set({isSigningUp: false});
      toast.success("Signup successful");
      get().connectSocket();
    } catch (error) {
      console.log("Error in signup  frontend controller->", error);
      return toast.error(error.response.data.message);
    } finally {
      set({isSigningUp: false});
    }
  },
  login: async (data) => {
    set({isLoggingIng: true});
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({authUser: res.data});
      set({isLoggingIng: false});
      toast.success("Login successful");
      get().connectSocket();
    } catch (error) {
      console.log("Error in login frontend controller->", error);
      return toast.error(error.response.data.message);
    } finally {
      set({isLoggingIng: false});
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({authUser: null});
      toast.success("Logout successful");
      get().disconnectSocket();
    } catch (error) {
      console.log("Error in logout frontend controller->", error);
      toast.error(error.response.data.message);
    }
  },
  updateProfile: async (data) => {
    set({isUpdatingProfile: true});
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      console.log("response-->", res);
      set({authUser: res.data});
      set({isUpdatingProfile: false});
      return toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile frontend controller->", error);
      return toast.error(error.response.data.message);
    } finally {
      set({isUpdatingProfile: false});
    }
  },
  connectSocket: () => {
    const {authUser} = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({socket: socket});
    socket.on("getOnlineUsers", (userId) => {
      set({onlineUsers: userId});
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
  },
}));
