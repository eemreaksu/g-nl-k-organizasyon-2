import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function UserLayout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-[#1e2b6e] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black italic tracking-tighter" style={{ transform: 'skewX(-2deg)' }}>
                DECATHLON <span className="text-[#c2ff00] text-sm ml-1 uppercase">Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-white">{currentUser?.name}</span>
                <span className="text-[10px] text-[#c2ff00] font-black uppercase tracking-widest">{currentUser?.role}</span>
              </div>
              <button onClick={handleLogout} className="p-2 ml-2 text-white/70 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full relative">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-[#1e2b6e] pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 100%)' }} />
        <div className="relative z-10 p-2 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
