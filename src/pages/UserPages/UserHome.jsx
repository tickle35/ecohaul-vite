import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { API_ENDPOINTS } from '../../config/api';
import AirQualityMapLayer from '../../components/AirQualityMapLayer';

const UserHome = () => {
  const { userInfo, fetchUserRequests } = useAuthStore();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState(null);
  
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
  
  const handleMapClick = (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();
    
    setLat(clickedLat);
    setLong(clickedLng);
    setMarkerPosition({ lat: clickedLat, lng: clickedLng });
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
      console.log('API endpoint:', API_ENDPOINTS.REQUEST.CREATE);
      
      // Set up axios with proper headers
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(API_ENDPOINTS.REQUEST.CREATE, requestData, config);
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

  const handleMapLoad = (map) => {
    mapRef.current = map;
    setMapLoaded(true);
    
    // Set initial bounds
    if (map && map.getBounds()) {
      const bounds = map.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      setMapBounds({
        north: ne.lat(),
        east: ne.lng(),
        south: sw.lat(),
        west: sw.lng()
      });
    }
  };

  const handleBoundsChanged = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        setMapBounds({
          north: ne.lat(),
          east: ne.lng(),
          south: sw.lat(),
          west: sw.lng()
        });
      }
    }
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
        
        <div className="flex flex-1 space-x-6">
          {/* Map */}
          <div className="w-3/5 bg-white rounded-lg shadow-md relative">
            <LoadScript googleMapsApiKey={googleMapsApiKey} onLoad={() => console.log('Script loaded')}>
              {mapLoaded || (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p>Loading map...</p>
                </div>
              )}
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={14}
                onClick={handleMapClick}
                onLoad={handleMapLoad}
                onBoundsChanged={handleBoundsChanged}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={(e) => {
                      const newLat = e.latLng.lat();
                      const newLng = e.latLng.lng();
                      setLat(newLat);
                      setLong(newLng);
                      setMarkerPosition({ lat: newLat, lng: newLng });
                    }}
                  />
                )}
                
                {/* Air Quality Map Layer */}
                {mapBounds && mapRef.current && (
                  <AirQualityMapLayer 
                    bounds={mapBounds}
                    mapRef={mapRef}
                  />
                )}
              </GoogleMap>
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