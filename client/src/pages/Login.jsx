import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ⚠️ CHANGE localhost to your Render URL when online
      const res = await axios.post('http://localhost:3000/login', { email, password });
      setToken(res.data.user); // Save login info
      localStorage.setItem('user', JSON.stringify(res.data.user)); // Keep logged in
      navigate('/'); // Go to Dashboard
    } catch (err) {
      setError("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Budgemart Admin</h1>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email (admin@budgemart.com)" required
            className="w-full p-3 border rounded-lg"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password (admin)" required
            className="w-full p-3 border rounded-lg"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
            Login
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4">Default: admin@budgemart.com / admin</p>
      </div>
    </div>
  );
}