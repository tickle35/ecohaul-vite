import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authStore';

const AiPage = () => {
  const { userInfo } = useAuthStore();
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([
    { 
      question: 'What types of e-waste do you collect?', 
      answer: 'We collect all types of electronic waste including computers, laptops, mobile phones, tablets, TVs, monitors, printers, and small household appliances.' 
    },
    { 
      question: 'How do I prepare my e-waste for collection?', 
      answer: 'Please remove any personal data from devices, disconnect all cables, and package items securely. For larger items, no special preparation is needed.' 
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === '') return;
    
    // In a real app, this would call an AI API
    const mockResponses = {
      'recycling': 'Recycling e-waste is crucial for recovering valuable materials and preventing toxic substances from entering landfills. Our process involves sorting, dismantling, and processing components in an environmentally responsible manner.',
      'pickup': 'We offer scheduled pickups for e-waste. Simply make a request through our app, select a convenient time, and our team will arrive at your location.',
      'schedule': 'You can schedule a pickup through the "Make Request" section. Select your preferred date and time, and our system will assign a driver to collect your e-waste.',
      'materials': 'We accept most electronic devices including computers, phones, TVs, and small appliances. We currently don\'t accept large appliances like refrigerators or washing machines.'
    };
    
    let answer = 'I don\'t have specific information about that. Please contact our customer support for more details.';
    
    // Simple keyword matching
    for (const [keyword, response] of Object.entries(mockResponses)) {
      if (query.toLowerCase().includes(keyword)) {
        answer = response;
        break;
      }
    }
    
    setResponses([...responses, { question: query, answer }]);
    setQuery('');
  };

  return (
    <div className="flex h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
        </div>
        
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          {/* AI header */}
          <div className="bg-primary text-white p-4">
            <h2 className="text-lg font-semibold">EcoHaul AI Assistant</h2>
            <p className="text-sm opacity-80">Ask me anything about e-waste management</p>
          </div>
          
          {/* Q&A section */}
          <div className="flex-1 p-4 overflow-y-auto">
            {responses.map((item, index) => (
              <div key={index} className="mb-6">
                <div className="flex items-start mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="text-gray-600 font-bold">U</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p className="text-gray-800">{item.question}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-[80%]">
                    <p className="text-gray-800">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Query input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about e-waste management..."
              className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-[#0e8a64] transition-colors"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiPage; 