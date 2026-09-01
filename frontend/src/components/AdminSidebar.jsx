import { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, Settings, LogOut, Menu, X, Activity, Tags } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminLayout } from '../context/AdminLayoutContext';
import { authAPI } from '../API';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, sidebarOpen, setSidebarOpen } = useAdminLayout();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error clearing session cookie:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const menuItems = [
    { label: 'Dashboard', icon: Activity, path: '/admin/dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Providers', icon: UserCheck, path: '/admin/providers' },
    { label: 'Services', icon: Briefcase, path: '/admin/services' },
    { label: 'Categories', icon: Tags, path: '/admin/categories' },
    // { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isMobile ? 'fixed w-64' : 'relative w-64'
        } bg-[#fffaf5] border-r border-[#eadcc7] transition-all duration-300 top-0 left-0 h-screen z-40 shadow-[0_10px_30px_rgba(70,42,28,0.04)]`}
      >
        <div className="flex items-center justify-between border-b border-[#eadcc7] p-4">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-black tracking-[-0.05em] text-[#201a17] md:text-xl">Ghar<span className="text-[#c96d42]">Doctor</span></h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Admin</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#6e5d57] transition-colors hover:text-[#201a17] md:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="space-y-2 p-3 md:p-2 lg:p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-full px-3 py-2.5 transition-all ${
                  active
                    ? 'border border-[#e7ba9a] bg-[#f9efe6] text-[#8e4d2f] shadow-[0_10px_22px_rgba(201,109,66,0.08)]'
                    : 'text-[#5b4d49] hover:bg-[#f4e7dc] hover:text-[#201a17]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-[#5b4d49] transition-colors hover:bg-[#f9ece9] hover:text-[#8a4d2b]"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
