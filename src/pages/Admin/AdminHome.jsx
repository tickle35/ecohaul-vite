import React, { useState, useEffect, useRef } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { GoogleMap, Marker } from '@react-google-maps/api';
import searchIcon from '../../resources/searchIcon.png';
import { API_ENDPOINTS } from '../../config/api';
import AirQualityMapLayer from '../../components/AirQualityMapLayer';
import { useGoogleMaps } from '../../components/GoogleMapsProvider';

const AdminHome = () => {
  const { userInfo } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef(null);
  const [mapBounds, setMapBounds] = useState(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const [showAirQuality, setShowAirQuality] = useState(true);
  
  const [mapCenter, setMapCenter] = useState({
    lat: 5.6037,  // Default to Accra, Ghana
    lng: -0.1870
  });
  
  useEffect(() => {
    fetchRequests();
    fetchDrivers();
  }, []);
  
  const fetchRequests = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.REQUEST.ALL);
      console.log('Requests data:', res.data);
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };
  
  const fetchDrivers = async () => {
    try {
      // Update to use auth/drivers endpoint instead of just drivers
      const res = await axios.get(API_ENDPOINTS.AUTH.DRIVERS);
      console.log('Drivers data:', res.data);
      setDrivers(res.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter(request => 
        (request.title && request.title.toLowerCase().includes(term.toLowerCase())) ||
        (request.description && request.description.toLowerCase().includes(term.toLowerCase())) ||
        (request.author && request.author.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredRequests(filtered);
    }
  };
  
  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    if (request.lat && request.lng) {
      setMapCenter({
        lat: request.lat,
        lng: request.lng
      });
    } else if (request.lat && request.long) {
      // Handle case where lng might be stored as long
      setMapCenter({
        lat: request.lat,
        lng: request.long
      });
    }
  };
  
  const handleAssignDriver = async () => {
    if (!selectedRequest || !selectedDriver) {
      setError('Please select both a request and a driver');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.put(`${API_ENDPOINTS.REQUEST.ASSIGN_DRIVER}/${selectedRequest._id}`, {
        driverId: selectedDriver,
        status: 'in-progress'
      });
      
      fetchRequests();
      setSelectedRequest(null);
      setSelectedDriver('');
    } catch (error) {
      console.error('Error assigning driver:', error);
      setError('Failed to assign driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem'
  };
  
  // Handle map load success
  const handleMapLoad = (map) => {
    console.log('Google Maps loaded successfully');
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
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNavbar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with user info and search */}
        <div className="w-full p-4 flex justify-between items-center bg-white shadow-sm">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Haul Requests</h1>
            <div className="ml-4 text-sm text-gray-600">
              Welcome, {userInfo?.username || 'Admin'} | {userInfo?.comAssociate || 'Company'}
            </div>
          </div>
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
            <div className="w-1/2 bg-white rounded-md flex items-center px-4 py-2 border border-gray-200">
              <img src={searchIcon} alt="Search" className="w-5 h-5 mr-3" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={handleSearch}
                className="flex-1 outline-none text-gray-500 bg-white"
              />
            </div>
          </div>
        </div>
        
        {/* Main content area with fixed height and scrolling */}
        <div className="flex flex-1 p-4 gap-6 overflow-hidden">
          {/* Requests list with fixed height and scrolling */}
          <div className="w-1/3 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">All Requests</h2>
            </div>
            
            {/* Scrollable list container */}
            <div className="overflow-y-auto flex-1 p-4">
              {filteredRequests.length > 0 ? (
                <ul className="space-y-2">
                  {filteredRequests.map((request) => (
                    <li 
                      key={request._id} 
                      className={`border border-gray-200 p-3 rounded-md hover:bg-gray-50 cursor-pointer ${
                        selectedRequest?._id === request._id ? 'bg-primary bg-opacity-10 border-primary' : ''
                      }`}
                      onClick={() => handleRequestSelect(request)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-gray-800">{request.title || request.type || 'Untitled'}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.description ? `${request.description.substring(0, 50)}...` : `${request.type || 'No description'}`}
                      </p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>By: {request.author || 'Unknown'}</span>
                        <span>{request.createdAt ? formatDate(request.createdAt) : 'No date'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No requests found.
                </div>
              )}
            </div>
          </div>
          
          {/* Map and details with fixed height and scrolling */}
          <div className="w-2/3 flex flex-col gap-4 overflow-hidden">
            {/* Map with error handling */}
            <div className="h-2/3 bg-white rounded-lg shadow-md overflow-hidden relative">
              {!isLoaded ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <p>Loading map...</p>
                </div>
              ) : loadError || mapError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center p-4">
                    <p className="text-red-500 mb-2">Failed to load Google Maps</p>
                    <button 
                      onClick={() => setMapError(false)} 
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#0e8a64]"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={13}
                    onLoad={handleMapLoad}
                    onBoundsChanged={handleBoundsChanged}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: true,
                      fullscreenControl: true,
                    }}
                  >
                    {selectedRequest && selectedRequest.lat && (
                      <Marker 
                        position={{
                          lat: parseFloat(selectedRequest.lat),
                          lng: parseFloat(selectedRequest.lng || selectedRequest.long)
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
            
            {/* Request details with scrolling */}
            <div className="h-1/3 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">
                  {selectedRequest ? 'Request Details' : 'Select a Request'}
                </h2>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4">
                {selectedRequest ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedRequest.title || selectedRequest.type || 'Untitled'}</h2>
                      <p className="text-gray-600 mb-2">{selectedRequest.description || 'No description available'}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-semibold">Waste Type:</span> {selectedRequest.wasteType || selectedRequest.type || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-semibold">Quantity:</span> {selectedRequest.quantity || 'N/A'} {selectedRequest.quantity ? 'kg' : ''}
                        </div>
                        <div>
                          <span className="font-semibold">Location:</span> {selectedRequest.location || `${selectedRequest.lat}, ${selectedRequest.lng || selectedRequest.long}`}
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span> {selectedRequest.status}
                        </div>
                      </div>
                    </div>
                    
                    {selectedRequest.status === 'pending' && (
                      <div className="mt-4">
                        {error && (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-sm">
                            {error}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select a driver</option>
                            {drivers.map(driver => (
                              <option key={driver._id} value={driver._id}>
                                {driver.username} - {driver.comAssociate || 'No company'}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={handleAssignDriver}
                            disabled={loading}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-[#0e8a64] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                          >
                            {loading ? 'Assigning...' : 'Assign Driver'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Select a request to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome; 