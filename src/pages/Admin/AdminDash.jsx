import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import useAuthStore from '../../store/authStore';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDash = () => {
  const { userInfo } = useAuthStore();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    inProgressRequests: 0,
    wasteTypes: {
      electronic: 0,
      plastic: 0,
      paper: 0,
      metal: 0,
      glass: 0,
      other: 0
    },
    monthlyRequests: {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    }
  });
  
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    setStats({
      totalRequests: 120,
      pendingRequests: 25,
      completedRequests: 80,
      inProgressRequests: 15,
      wasteTypes: {
        electronic: 45,
        plastic: 30,
        paper: 15,
        metal: 10,
        glass: 12,
        other: 8
      },
      monthlyRequests: {
        Jan: 8, Feb: 10, Mar: 12, Apr: 15, May: 8, Jun: 10,
        Jul: 12, Aug: 15, Sep: 10, Oct: 8, Nov: 7, Dec: 5
      }
    });
  }, []);
  
  const barChartData = {
    labels: Object.keys(stats.monthlyRequests),
    datasets: [
      {
        label: 'Monthly Requests',
        data: Object.values(stats.monthlyRequests),
        backgroundColor: '#179A72',
        borderColor: '#0e8a64',
        borderWidth: 1,
      },
    ],
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Requests',
      },
    },
  };
  
  const doughnutChartData = {
    labels: ['Electronic', 'Plastic', 'Paper', 'Metal', 'Glass', 'Other'],
    datasets: [
      {
        label: 'Waste Types',
        data: Object.values(stats.wasteTypes),
        backgroundColor: [
          '#179A72',
          '#36A2EB',
          '#FFCE56',
          '#FF6384',
          '#4BC0C0',
          '#9966FF',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNavbar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="w-full p-4 flex justify-between items-center bg-white shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome, {userInfo?.username || 'Admin'} | {userInfo?.comAssociate || 'Company'}
          </div>
        </div>
        
        {/* Main content with scrolling */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-gray-500 text-sm mb-1">Total Requests</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.totalRequests}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-yellow-500 text-sm mb-1">Pending</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingRequests}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-blue-500 text-sm mb-1">In Progress</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.inProgressRequests}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-green-500 text-sm mb-1">Completed</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.completedRequests}</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Activity</h2>
              <div className="h-80">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
            
            <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-4 flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Waste Types</h2>
              <div className="flex-1 flex items-center justify-center h-80">
                <Doughnut data={doughnutChartData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash; 