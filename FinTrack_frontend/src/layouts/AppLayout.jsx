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
      case '/reports':
        return {
          title: 'Financial Reports & Exports',
          subtitle: 'Generate date-range summaries, export CSV spreadsheets, and print PDF statements',
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
    <div className="min-h-screen bg-slate-50 print:bg-white flex">
      {/* Sidebar - hidden on print */}
      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 print:pl-0">
        <div className="print:hidden">
          <TopNavbar
            onOpenSidebar={() => setSidebarOpen(true)}
            pageTitle={title}
            pageSubtitle={subtitle}
          />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
