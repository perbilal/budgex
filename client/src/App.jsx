import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Settings from './pages/Setting';

export default function App() {
  // 1. CHECK IF USER IS LOGGED IN
  // We check the browser's "localStorage" to see if they logged in before
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // 2. LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('user'); // Delete the key
    setUser(null); // Switch state to "not logged in"
  };

  return (
    <BrowserRouter>
      {/* 3. THE SECURITY CHECK */}
      {/* If user is NULL (not logged in), show LOGIN PAGE only */}
      {!user ? (
        <Login setToken={setUser} />
      ) : (
        // If user EXISTS, show the Main App (Sidebar + Pages)
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
          
          {/* Sidebar Navigation */}
          <Sidebar logout={handleLogout} />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<Settings />} />
              {/* If they go to a wrong link, send them back to Dashboard */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}