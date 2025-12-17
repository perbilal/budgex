import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Lock } from 'lucide-react';

export default function Settings() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Get current user email from local storage
  const user = JSON.parse(localStorage.getItem('user'));
  const API_URL = 'http://localhost:3000';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.put(`${API_URL}/change-password`, {
        email: user.email,
        oldPassword,
        newPassword
      });
      setMessage("✅ Password changed successfully!");
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <ShieldCheck /> Settings
      </h2>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h3>
        
        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Old Password</label>
            <input 
              type="password" 
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
            <input 
              type="password" 
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}