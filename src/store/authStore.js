import { create } from 'zustand';
import axios from 'axios';
import { API_ENDPOINTS, createUrl } from '../config/api';

const useAuthStore = create((set, get) => ({
  isLoading: true,
  userToken: null,
  userInfo: null,
  userRequests: [],
  streamToken: "",

  login: async (email, password) => {
    try {
      const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
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
      const byEmailUrl = createUrl(API_ENDPOINTS.REQUEST.BY_EMAIL, { email });
      console.log('Making API call to:', byEmailUrl);
      const res = await axios.get(byEmailUrl);
      
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
        const userHistoryUrl = createUrl(API_ENDPOINTS.REQUEST.USER_HISTORY, { author: email });
        console.log('Falling back to old endpoint:', userHistoryUrl);
        const fallbackRes = await axios.get(userHistoryUrl);
        
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
      const res = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
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