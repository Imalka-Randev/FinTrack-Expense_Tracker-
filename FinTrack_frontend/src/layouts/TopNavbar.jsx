import React from 'react';
import { Menu, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const TopNavbar = ({ onOpenSidebar, pageTitle = 'Dashboard', pageSubtitle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Quick actions & user info */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium text-slate-700">
            {user?.name || 'Account'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
