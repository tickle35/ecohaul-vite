import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const UserHome = () => {
  const { userInfo, fetchUserRequests } = useAuthStore();
  const navigate = useNavigate();
  
  // Log user info on component mount
  console.log('UserHome - User Info:', userInfo);
  
  const [type, setType] = useState('Plastic');
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [mapCenter, setMapCenter] = useState({
    lat: 5.6037,  // Default to Accra, Ghana
    lng: -0.1870
  });
  
  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
    
    // Fetch user requests when component mounts
    if (userInfo && userInfo.email) {
      fetchUserRequests(userInfo.email);
    }
  }, [userInfo, fetchUserRequests]);
  
  const getUserLocation = () => {
    console.log('Getting user location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', { latitude, longitude });
        setLat(latitude);
        setLong(longitude);
        setMarkerPosition({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
      }, (error) => {
        console.error('Geolocation error:', error);
        setError('Error: The Geolocation service failed.');
      });
    } else {
      console.error('Browser does not support geolocation');
      setError('Error: Your browser doesn\'t support geolocation.');
    }
  };
  
  const handleMapClick = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    console.log('Map clicked at:', { lat: newLat, lng: newLng });
    setLat(newLat);
    setLong(newLng);
    setMarkerPosition({ lat: newLat, lng: newLng });
  };
  
  const handleTypeChange = (e) => {
    console.log('Waste type changed to:', e.target.value);
    setType(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with values:', { type, lat, long });
    
    if (!lat || !long) {
      console.error('Location not selected');
      setError('Please select a location on the map');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Make sure we have the required fields according to the Request model
      const requestData = {
        type: type, // Should be one of: "Plastic", "Paper", "Glass", "Metal", "Other"
        status: 'Pending', // Should be one of: "Pending", "completed"
        lat: Number(lat), // Ensure it's a number
        long: Number(long), // Ensure it's a number
        author: userInfo?.email || 'anonymous', // Fallback if email is missing
        userId: userInfo?.id || userInfo?._id || 'anonymous' // Fallback if id is missing
      };
      
      console.log('Sending request data to API:', requestData);
      console.log('API endpoint:', 'http://localhost:8080/api/request');
      
      // Set up axios with proper headers
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post('http://localhost:8080/api/request', requestData, config);
      console.log('API response:', response.data);
      
      // Show success message
      alert('Request created successfully!');
      
      // Fetch updated user requests after successful submission
      if (userInfo && userInfo.email) {
        console.log('Fetching updated user requests after submission');
        await fetchUserRequests(userInfo.email);
      }
      
      navigate('/userhome');
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(`Failed to create request: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem'
  };
  
  // Fallback API key in case environment variable is not set
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_oFQ3l8sdvksjPmf-q5lK75YPv0N2Kp4';
  
  return (
    <div className="flex h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Make a Haul Request</h1>
          <div>
            <p className="text-sm text-gray-600">User: {userInfo?.email || 'Not logged in'}</p>
            {userInfo?.id && <p className="text-xs text-gray-500">ID: {userInfo.id}</p>}
          </div>
        </div>
        
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Map */}
          <div className="w-3/5 bg-white rounded-lg shadow-md overflow-hidden">
            <LoadScript 
              googleMapsApiKey={googleMapsApiKey}
              onLoad={() => {
                console.log('Google Maps script loaded');
                setMapLoaded(true);
              }}
              onError={(error) => {
                console.error('Google Maps script error:', error);
                setError('Failed to load Google Maps. Please check your API key.');
              }}
            >
              {mapLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={13}
                  onClick={handleMapClick}
                  onLoad={() => {
                    console.log('Map loaded successfully');
                  }}
                >
                  {markerPosition && (
                    <Marker position={markerPosition} />
                  )}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Loading map...</p>
                </div>
              )}
            </LoadScript>
          </div>
          
          {/* Form */}
          <div className="w-2/5 bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Waste Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={handleTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Plastic">Plastic</option>
                  <option value="Paper">Paper</option>
                  <option value="Glass">Glass</option>
                  <option value="Metal">Metal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="w-full mb-4 bg-secondary text-primary py-2 px-4 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Use My Current Location
                </button>
                
                <button
                  type="submit"
                  disabled={loading || !lat || !long}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-[#0e8a64] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Make Request'}
                </button>
                
                {!lat || !long ? (
                  <p className="text-xs text-red-500 mt-2">Please select a location on the map first</p>
                ) : (
                  <p className="text-xs text-green-500 mt-2">Location selected: {lat.toFixed(6)}, {long.toFixed(6)}</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome; 