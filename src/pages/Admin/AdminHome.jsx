import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import searchIcon from '../../resources/searchIcon.png';

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
      const res = await axios.get('http://localhost:8080/api/request/all');
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };
  
  const fetchDrivers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/auth/drivers');
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
        request.title.toLowerCase().includes(term.toLowerCase()) ||
        request.description.toLowerCase().includes(term.toLowerCase()) ||
        request.author.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredRequests(filtered);
    }
  };
  
  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setMapCenter({
      lat: request.lat,
      lng: request.lng
    });
  };
  
  const handleAssignDriver = async () => {
    if (!selectedRequest || !selectedDriver) {
      setError('Please select both a request and a driver');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.put(`http://localhost:8080/api/request/assign/${selectedRequest._id}`, {
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
  
  return (
    <div className="flex h-screen bg-background">
      <AdminNavbar />
      
      <div className="flex-1 flex flex-col">
        {/* Top search bar */}
        <div className="w-full p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Haul Requests</h1>
          <div className="w-1/2 bg-white rounded-md flex items-center px-4 py-2 shadow-sm">
            <img src={searchIcon} alt="Search" className="w-5 h-5 mr-3" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1 outline-none text-gray-500"
            />
          </div>
        </div>
        
        <div className="flex flex-1 p-4 gap-6">
          {/* Requests list */}
          <div className="w-1/3 bg-white rounded-lg shadow-md p-4 overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Requests</h2>
            
            <div className="overflow-y-auto flex-1">
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
                        <h3 className="font-semibold text-gray-800">{request.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{request.description.substring(0, 50)}...</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>By: {request.author}</span>
                        <span>{formatDate(request.createdAt)}</span>
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
          
          {/* Map and details */}
          <div className="w-2/3 flex flex-col gap-4">
            {/* Map */}
            <div className="h-2/3 bg-white rounded-lg shadow-md overflow-hidden">
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={13}
                >
                  {selectedRequest && (
                    <Marker 
                      position={{ lat: selectedRequest.lat, lng: selectedRequest.lng }} 
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
            
            {/* Request details */}
            <div className="h-1/3 bg-white rounded-lg shadow-md p-4">
              {selectedRequest ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedRequest.title}</h2>
                    <p className="text-gray-600 mb-2">{selectedRequest.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">Waste Type:</span> {selectedRequest.wasteType}
                      </div>
                      <div>
                        <span className="font-semibold">Quantity:</span> {selectedRequest.quantity} kg
                      </div>
                      <div>
                        <span className="font-semibold">Location:</span> {selectedRequest.location}
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
                              {driver.username} - {driver.comAssociate}
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
  );
};

export default AdminHome; 