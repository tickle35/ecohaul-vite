import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import searchIcon from '../../resources/searchIcon.png';
import { API_ENDPOINTS } from '../../config/api';

const AdminDrive = () => {
  const { userInfo } = useAuthStore();
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    comAssociate: userInfo?.comAssociate || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchError, setFetchError] = useState('');
  
  useEffect(() => {
    fetchDrivers();
  }, []);
  
  const fetchDrivers = async () => {
    setFetchError('');
    try {
      console.log('Fetching drivers from:', API_ENDPOINTS.AUTH.DRIVERS);
      const res = await axios.get(API_ENDPOINTS.AUTH.DRIVERS);
      console.log('Drivers data:', res.data);
      setDrivers(res.data);
      setFilteredDrivers(res.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setFetchError('Failed to fetch drivers. Please try again later.');
    }
  };
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredDrivers(drivers);
    } else {
      const filtered = drivers.filter(driver => 
        driver.username.toLowerCase().includes(term.toLowerCase()) ||
        driver.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredDrivers(filtered);
    }
  };
  
  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
        ...formData,
        role: 'driver',
        lat: 0,
        long: 0
      });
      
      setSuccess('Driver added successfully');
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        comAssociate: userInfo?.comAssociate || '',
      });
      
      fetchDrivers();
    } catch (error) {
      console.error('Error adding driver:', error);
      setError('Failed to add driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-background">
      <AdminNavbar />
      
      <div className="flex-1 flex flex-col">
        {/* Top search bar */}
        <div className="w-full p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Drivers</h1>
          <div className="w-1/2 bg-white rounded-md flex items-center px-4 py-2 shadow-sm">
            <img src={searchIcon} alt="Search" className="w-5 h-5 mr-3" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1 outline-none text-gray-500"
            />
          </div>
        </div>
        
        <div className="flex flex-1 p-4 gap-6">
          {/* Drivers list */}
          <div className="w-2/3 bg-white rounded-lg shadow-md p-4 overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Drivers</h2>
            
            {fetchError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {fetchError}
                <button 
                  onClick={fetchDrivers}
                  className="ml-4 underline text-blue-600 hover:text-blue-800"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <div className="overflow-y-auto flex-1">
              {filteredDrivers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredDrivers.map((driver) => (
                    <div 
                      key={driver._id} 
                      className={`border border-gray-200 p-4 rounded-md hover:bg-gray-50 cursor-pointer ${
                        selectedDriver?._id === driver._id ? 'bg-primary bg-opacity-10 border-primary' : ''
                      }`}
                      onClick={() => handleDriverSelect(driver)}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {driver.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-800">{driver.username}</h3>
                          <p className="text-sm text-gray-600">{driver.email}</p>
                        </div>
                        <div className="ml-auto">
                          <p className="text-sm text-gray-600">Phone: {driver.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {fetchError ? 'Error loading drivers.' : 'No drivers found.'}
                </div>
              )}
            </div>
          </div>
          
          {/* Add driver form */}
          <div className="w-1/3 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Driver</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter driver name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter driver email"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter driver phone number"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter driver password"
                />
              </div>
              
              <div>
                <label htmlFor="comAssociate" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  id="comAssociate"
                  name="comAssociate"
                  type="text"
                  value={formData.comAssociate}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-[#0e8a64] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 mt-4"
              >
                {loading ? 'Adding...' : 'Add Driver'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDrive; 