import { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, Settings, LogOut, Menu, X, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminLayout } from '../context/AdminLayoutContext';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, sidebarOpen, setSidebarOpen } = useAdminLayout();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const menuItems = [
    { label: 'Dashboard', icon: Activity, path: '/admin-dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Providers', icon: UserCheck, path: '/admin/providers' },
    { label: 'Services', icon: Briefcase, path: '/admin/services' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isMobile ? 'fixed w-64' : 'relative w-64'
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 top-0 left-0 h-screen z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-lg md:text-xl font-bold text-cyan-400">GharDoctor</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors md:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 md:p-2 lg:p-4 space-y-2">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
