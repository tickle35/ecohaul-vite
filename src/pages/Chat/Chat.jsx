import React, { useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import useAuthStore from '../../store/authStore';

const Chat = () => {
  const { userInfo } = useAuthStore();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Admin', text: 'Hello! How can I help you today?', timestamp: new Date() },
    { id: 2, sender: 'User', text: 'I have a question about my waste collection.', timestamp: new Date(Date.now() - 60000) }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const message = {
      id: messages.length + 1,
      sender: userInfo.username,
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminNavbar />
      
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
        </div>
        
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-primary text-white p-4">
            <h2 className="text-lg font-semibold">EcoHaul Support</h2>
            <p className="text-sm opacity-80">Ask us anything about waste management</p>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 flex ${message.sender === userInfo.username ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === userInfo.username 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">
                      {message.sender === userInfo.username ? 'You' : message.sender}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-[#0e8a64] transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 