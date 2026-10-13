import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: 'Financial Dashboard',
          subtitle: 'Overview of your income, expenses, and monthly financial health',
        };
      case '/transactions':
        return {
          title: 'Transactions',
          subtitle: 'Manage and review your recorded income and expenses',
        };
      case '/budgets':
        return {
          title: 'Budget Planner',
          subtitle: 'Set category spending limits and monitor budget progress',
        };
      default:
        return {
          title: 'FinTrack',
          subtitle: 'Personal Finance Manager',
        };
    }
  };

  const { title, subtitle } = getPageMeta();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={title}
          pageSubtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
