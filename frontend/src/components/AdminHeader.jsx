import { Menu } from 'lucide-react';
import { useAdminLayout } from '../context/AdminLayoutContext';
import ImageWithFallback from './ImageWithFallback';

export default function AdminHeader({ title, subtitle, user }) {
  const { toggleSidebar } = useAdminLayout();

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#eadcc7] bg-[#fffdfb]/85 p-3 backdrop-blur-sm md:p-4 lg:p-6">
      <button
        onClick={toggleSidebar}
        className="mr-3 rounded-full border border-[#eadcc7] bg-[#fffaf5] p-2 text-[#5e4d48] transition-colors hover:text-[#201a17] md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <h2 className="text-xl font-black tracking-[-0.05em] text-[#201a17] md:text-2xl">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-[#655d5a] md:mt-1 md:text-sm">{subtitle}</p>
        )}
      </div>

      <div className="ml-2 flex items-center gap-2 md:gap-4">
        {user && (
          <>
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-[#201a17]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-[#776b66]">{user.email}</p>
            </div>
            <ImageWithFallback
              src={user.profileImg}
              alt={`${user.firstName || 'User'} profile`}
              fallback={user.firstName?.charAt(0) || 'U'}
              className="h-8 w-8 rounded-full border border-[#eadcc7] bg-[#f7efe8] md:h-10 md:w-10"
            />
          </>
        )}
      </div>
    </div>
  );
}
