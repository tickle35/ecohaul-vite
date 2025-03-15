import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authStore';
import searchIcon from '../../resources/searchIcon.png';
import backIcon from '../../resources/backIcon.png';
import { Link } from 'react-router-dom';

const User = () => {
  const { userInfo, userRequests } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    if (userRequests) {
      setFilteredRequests(userRequests);
    }
  }, [userRequests]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredRequests(userRequests);
    } else {
      const filtered = userRequests.filter(request => 
        request.title.toLowerCase().includes(term.toLowerCase()) ||
        request.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredRequests(filtered);
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

  return (
    <div className="flex h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 flex flex-col">
        {/* Top search bar */}
        <div className="w-full p-4 flex justify-end">
          <div className="w-1/2 bg-white rounded-md flex items-center px-4 py-2 shadow-sm">
            <img src={searchIcon} alt="Search" className="w-5 h-5 mr-3" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1 outline-none text-gray-500 bg-white"
            />
          </div>
        </div>
        
        {/* Welcome section */}
        <div className="w-11/12 mx-auto mt-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {userInfo?.username}</h1>
            <Link 
              to="/makerequest" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-[#0e8a64] transition-all"
            >
              Make Request
            </Link>
          </div>
          
          <div className="bg-secondary rounded-md p-4 flex items-center justify-between">
            <div className="w-1/2">
              <h2 className="text-gray-800 font-bold mb-2">
                <span className="text-2xl">Welcome to EcoHaul</span>
              </h2>
              <p className="text-gray-600">Your trusted partner for e-waste management</p>
            </div>
            {/* Background image will be handled by the container's styling */}
          </div>
        </div>
        
        {/* Request history */}
        <div className="w-11/12 mx-auto mt-6 bg-white rounded-md p-4 flex-1 overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Request History</h2>
          
          <div className="bg-gray-100 rounded-md p-3 grid grid-cols-4 gap-4 mb-4">
            <h3 className="font-semibold text-gray-700">Title</h3>
            <h3 className="font-semibold text-gray-700">Date</h3>
            <h3 className="font-semibold text-gray-700">Status</h3>
            <h3 className="font-semibold text-gray-700">Actions</h3>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredRequests.length > 0 ? (
              <ul className="space-y-2">
                {filteredRequests.map((request) => (
                  <li 
                    key={request._id} 
                    className="border-t border-gray-200 grid grid-cols-4 gap-4 p-3 hover:bg-gray-50"
                  >
                    <div className="text-gray-800">{request.type}</div>
                    <div className="text-gray-600">{formatDate(request.createdAt)}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div>
                      <button className="text-primary hover:text-[#0e8a64]">
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No requests found. Make your first request!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User; 