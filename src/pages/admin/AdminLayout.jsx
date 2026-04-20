import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Activity, LogOut, Settings, Store } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminLayout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Günün Organizasyonu', path: '/admin/daily', icon: Store },
    { name: 'Kaptan Organizasyonu', path: '/admin/captains', icon: Calendar },
    { name: 'Departmanlar & Kişiler', path: '/admin/departments', icon: Users },
    { name: 'Productivity', path: '/admin/productivity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="bg-[#1e2b6e] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <div 
                className="text-2xl font-black italic tracking-tighter"
                style={{ transform: 'skewX(-2deg)' }}
              >
                DECATHLON <span className="text-[#c2ff00] text-sm ml-1 uppercase">Admin</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 lg:space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "px-3 py-2 rounded-md text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2",
                    isActive 
                      ? "bg-white/10 text-[#c2ff00]" 
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon size={16} />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* User & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-white">{currentUser?.name}</span>
                <span className="text-[10px] text-[#c2ff00] font-black uppercase tracking-widest">{currentUser?.role}</span>
              </div>
              <div className="h-8 w-8 bg-[#c2ff00] rounded-full flex items-center justify-center text-[#1e2b6e] font-black shadow-md">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 ml-2 text-white/70 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                title="Çıkış Yap"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (Scrollable horizontally) */}
        <div className="md:hidden overflow-x-auto border-t border-white/10 hide-scrollbar pb-2 pt-2 px-2">
          <div className="flex space-x-2 w-max">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "px-3 py-2 rounded-md text-xs font-bold uppercase whitespace-nowrap flex items-center gap-1.5 transition-colors",
                  isActive 
                    ? "bg-white/10 text-[#c2ff00]" 
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <item.icon size={14} />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-[#1e2b6e] pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 100%)' }} />
        <div className="relative z-10 p-2 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
    </div>
  );
}
