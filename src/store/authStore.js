import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set, get) => ({
  isLoading: true,
  userToken: null,
  userInfo: null,
  userRequests: [],
  streamToken: "",

  login: async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", { email, password });
      const { email: userEmail, role, token, username, streamToken, id, comAssociate } = res.data;
      const userInfo = { email: userEmail, role, username, id, comAssociate };
      
      set({ 
        userInfo, 
        userToken: token, 
        streamToken,
        isLoading: false 
      });
      
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("userToken", token);
      localStorage.setItem("streamToken", streamToken);
      
      get().fetchUserRequests(userEmail);
      return res;
    } catch (error) {
      console.error("Login error", error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUserRequests: async (email) => {
    console.log('Fetching user requests for email:', email);
    
    if (!email) {
      console.error('Email is undefined or null, cannot fetch requests');
      return [];
    }
    
    try {
      // Try the new endpoint first
      console.log('Making API call to:', `http://localhost:8080/api/request/byemail?email=${email}`);
      const res = await axios.get(`http://localhost:8080/api/request/byemail?email=${email}`);
      
      console.log('User requests API response:', res.data);
      console.log('Number of requests fetched:', res.data.length);
      
      // Store the requests in the state
      set({ userRequests: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching user requests:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Fallback to the old endpoint if the new one fails
      try {
        console.log('Falling back to old endpoint:', `http://localhost:8080/api/request/userhistory?author=${email}`);
        const fallbackRes = await axios.get(`http://localhost:8080/api/request/userhistory?author=${email}`);
        
        console.log('Fallback response:', fallbackRes.data);
        console.log('Number of requests fetched (fallback):', fallbackRes.data.length);
        
        set({ userRequests: fallbackRes.data });
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return [];
      }
    }
  },

  register: async (username, email, password, phone, role, comAssociate, lat, long) => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        username,
        email,
        password,
        phone,
        role,
        comAssociate,
        lat,
        long,
      });
      return res.status === 200;
    } catch (error) {
      console.error("Registration error", error);
      throw error;
    }
  },

  logout: () => {
    set({ 
      userToken: null, 
      userInfo: null,
      isLoading: false 
    });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userToken");
    localStorage.removeItem("streamToken");
  },

  checkAuth: () => {
    const storedUserInfo = localStorage.getItem("userInfo");
    const storedToken = localStorage.getItem("userToken");
    
    if (storedUserInfo && storedToken) {
      set({
        userInfo: JSON.parse(storedUserInfo),
        userToken: storedToken,
        isLoading: false
      });
      
      // Fetch user requests when auth is checked
      const userInfo = JSON.parse(storedUserInfo);
      if (userInfo && userInfo.email) {
        get().fetchUserRequests(userInfo.email);
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore; 