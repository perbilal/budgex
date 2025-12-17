import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, LogOut, Settings } from 'lucide-react';

export default function Sidebar({ logout }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/inventory', label: 'Inventory', icon: <Box size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-full md:w-64 bg-white md:h-screen shadow-md flex md:flex-col justify-between fixed md:relative bottom-0 md:top-0 z-20">
      
      {/* Logo Area */}
      <div className="hidden md:block p-6 border-b">
        <h1 className="text-xl font-bold text-indigo-600">Budgemart</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex md:flex-col flex-1 p-2 md:p-4 justify-around md:justify-start gap-2">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === item.path 
              ? 'bg-indigo-50 text-indigo-600 font-medium' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="text-sm md:text-base">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t hidden md:block">
        <button onClick={logout} className="flex items-center gap-3 text-red-500 hover:bg-red-50 w-full p-3 rounded-lg transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}