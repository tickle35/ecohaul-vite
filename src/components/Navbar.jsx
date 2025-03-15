import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Import images
import logo from '../resources/logo.png';
import homeIcon from '../resources/homeIcon.png';
import RequestIcon from '../resources/RequestIcon.png';

const Navbar = () => {
  const { logout } = useAuthStore();

  return (
    <div className="bg-primary h-screen w-[20%] flex flex-col items-center justify-between py-6">
      <div className="w-full flex justify-center">
        <img src={logo} className="w-3/4" alt="logo" />
      </div>
      
      <div className="w-full flex-1 mt-12">
        <ul className="flex flex-col gap-6 px-6">
          <Link 
            to="/userhome" 
            className="flex items-center gap-3 text-white hover:bg-[#0e8a64] px-4 py-3 rounded-md transition-all"
          >
            <img src={homeIcon} className="w-6 h-6" alt="home" />
            <span className="font-inter text-lg">Homepage</span>
          </Link>
          
          <Link 
            to="/makerequest" 
            className="flex items-center gap-3 text-white hover:bg-[#0e8a64] px-4 py-3 rounded-md transition-all"
          >
            <img src={RequestIcon} className="w-6 h-6" alt="request" />
            <span className="font-inter text-lg">Make Request</span>
          </Link>
        </ul>
      </div>
      
      <div className="w-full px-6 mb-8">
        <button 
          onClick={logout}
          className="flex items-center gap-3 text-white hover:bg-[#0e8a64] px-4 py-3 rounded-md transition-all w-full"
        >
          <img src={RequestIcon} className="w-6 h-6" alt="logout" />
          <span className="font-inter text-lg">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar; 