import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

// Create a context to share the Google Maps loading state
const GoogleMapsContext = createContext(null);

// Libraries to load with Google Maps
const libraries = ['places'];

export const GoogleMapsProvider = ({ children }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const value = { isLoaded, loadError };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

// Custom hook to use the Google Maps context
export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === null) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

export default GoogleMapsProvider; 