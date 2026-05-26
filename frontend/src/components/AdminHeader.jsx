import { Menu } from 'lucide-react';
import { useAdminLayout } from '../context/AdminLayoutContext';

export default function AdminHeader({ title, subtitle, user }) {
  const { toggleSidebar } = useAdminLayout();

  return (
    <div className="bg-slate-900/50 border-b border-slate-800 p-3 md:p-4 lg:p-6 flex items-center justify-between sticky top-0 z-20">
      {/* Menu toggle for mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-slate-400 hover:text-slate-200 transition-colors mr-3"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1">
        <h2 className="text-xl md:text-2xl font-bold text-slate-100">{title}</h2>
        {subtitle && (
          <p className="text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-2">
        {/* User info - hidden on mobile */}
        {user && (
          <>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-slate-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="w-8 md:w-10 h-8 md:h-10 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
              {user.firstName?.charAt(0)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
