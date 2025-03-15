/**
 * API Configuration
 * 
 * This file contains the base URL for all API calls.
 * Import this in any file that needs to make API requests.
 */

// Base API URL - change this when switching between environments
export const API_BASE_URL = "https://backend-qcnc.onrender.com";

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY: `${API_BASE_URL}/verifyuser`,
    DRIVERS: `${API_BASE_URL}/api/auth/drivers`,
  },
  
  // Request endpoints
  REQUEST: {
    CREATE: `${API_BASE_URL}/api/request`,
    ALL: `${API_BASE_URL}/api/request/allrequests`,
    USER_HISTORY: `${API_BASE_URL}/api/request/userhistory`,
    BY_EMAIL: `${API_BASE_URL}/api/request/byemail`,
    PLASTIC: `${API_BASE_URL}/api/request/plastic`,
    PAPER: `${API_BASE_URL}/api/request/paper`,
    ASSIGN_DRIVER: `${API_BASE_URL}/api/request/assigndriver`,
  },
  
  // Driver endpoints
  DRIVER: {
    BASE: `${API_BASE_URL}/api/auth/drivers`,
  },
  
  // Other endpoints
  USER_DATA: `${API_BASE_URL}/userData`,
  HEALTH: `${API_BASE_URL}/health`,
};

// Helper function to create URLs with query parameters
export const createUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export default API_ENDPOINTS; 