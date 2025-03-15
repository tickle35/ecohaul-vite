import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { API_ENDPOINTS } from '../../config/api';
import AirQualityMapLayer from '../../components/AirQualityMapLayer';
import { useGoogleMaps } from '../../components/GoogleMapsProvider';

const UserHome = () => {
  const { userInfo, fetchUserRequests } = useAuthStore();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const [showAirQuality, setShowAirQuality] = useState(true);
  
  // Log user info on component mount
  console.log('UserHome - User Info:', userInfo);
  
  const [type, setType] = useState('Plastic');
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  
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
        
        // Set initial bounds based on user location
        if (mapRef.current) {
          const map = mapRef.current;
          const bounds = map.getBounds();
          if (bounds) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            
            setMapBounds({
              north: ne.lat(),
              east: ne.lng(),
              south: sw.lat(),
              west: sw.lng()
            });
          } else {
            // If bounds not available, create a default bounds around the user location
            setMapBounds({
              north: latitude + 0.1,
              south: latitude - 0.1,
              east: longitude + 0.1,
              west: longitude - 0.1
            });
          }
        }
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
    console.log('Map loaded');
    mapRef.current = map;
    
    // Set initial bounds
    setTimeout(() => {
      if (map) {
        const bounds = map.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          
          console.log('Setting initial map bounds');
          setMapBounds({
            north: ne.lat(),
            east: ne.lng(),
            south: sw.lat(),
            west: sw.lng()
          });
        } else {
          // If bounds not available, create a default bounds around the center
          console.log('No bounds available, using default');
          setMapBounds({
            north: mapCenter.lat + 0.1,
            south: mapCenter.lat - 0.1,
            east: mapCenter.lng + 0.1,
            west: mapCenter.lng - 0.1
          });
        }
      }
    }, 1000); // Delay to ensure map is fully loaded
  };

  const handleBoundsChanged = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        console.log('Map bounds changed');
        setMapBounds({
          north: ne.lat(),
          east: ne.lng(),
          south: sw.lat(),
          west: sw.lng()
        });
      }
    }
  };
  
  return (
    <div className="flex h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Make a Haul Request</h1>
          <div className="flex items-center">
            <div className="mr-4">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showAirQuality} 
                  onChange={() => setShowAirQuality(!showAirQuality)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">Air Quality</span>
              </label>
            </div>
            <div>
              <p className="text-sm text-gray-600">User: {userInfo?.email || 'Not logged in'}</p>
              {userInfo?.id && <p className="text-xs text-gray-500">ID: {userInfo.id}</p>}
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 space-x-6">
          {/* Map */}
          <div className="w-3/5 bg-white rounded-lg shadow-md relative">
            {!isLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p>Loading map...</p>
              </div>
            ) : loadError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-red-500">Error loading maps</p>
              </div>
            ) : (
              <>
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
                  {showAirQuality && (
                    <AirQualityMapLayer 
                      bounds={mapBounds}
                      mapRef={mapRef}
                    />
                  )}
                </GoogleMap>
                
                {/* Air Quality Legend */}
                {showAirQuality && (
                  <div className="absolute bottom-2 right-2 bg-white p-2 rounded-md shadow-md text-xs">
                    <div className="font-bold mb-1">Air Quality Index</div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#009966] mr-1"></div>
                      <span>0-50: Good</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#FFDE33] mr-1"></div>
                      <span>51-100: Moderate</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#FF9933] mr-1"></div>
                      <span>101-150: Unhealthy for Sensitive Groups</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#CC0033] mr-1"></div>
                      <span>151-200: Unhealthy</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#660099] mr-1"></div>
                      <span>201-300: Very Unhealthy</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#7E0023] mr-1"></div>
                      <span>301+: Hazardous</span>
                    </div>
                  </div>
                )}
              </>
            )}
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