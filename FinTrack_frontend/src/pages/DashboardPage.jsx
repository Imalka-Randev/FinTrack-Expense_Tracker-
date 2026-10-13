import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { MONTHS } from '../utils/constants';
import SummaryCard from '../components/dashboard/SummaryCard';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import IncomeVsExpenseBarChart from '../components/dashboard/IncomeVsExpenseBarChart';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export const DashboardPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboard({
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Year options: past 3 years, current, and next year
  const currentYearNum = new Date().getFullYear();
  const yearOptions = [
    currentYearNum - 2,
    currentYearNum - 1,
    currentYearNum,
    currentYearNum + 1,
  ];

  const summary = dashboardData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Monthly Period</h2>
            <p className="text-xs text-slate-500">Filter analytics by billing period</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Select month"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Select year"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchDashboard}
            loading={loading}
            aria-label="Refresh dashboard data"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/transactions?add=true')}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <ErrorMessage
          title="Could not load dashboard"
          message={error}
          onRetry={fetchDashboard}
        />
      )}

      {/* Loading Spinner for initial load */}
      {loading && !dashboardData && (
        <LoadingSpinner message="Calculating your financial overview..." />
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummaryCard
          title="Total Income"
          amount={summary.totalIncome}
          icon={TrendingUp}
          variant="income"
          subtitle={`Earnings recorded in ${MONTHS.find((m) => m.value === selectedMonth)?.label}`}
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary.totalExpenses}
          icon={TrendingDown}
          variant="expense"
          subtitle={`Spendings recorded in ${MONTHS.find((m) => m.value === selectedMonth)?.label}`}
        />
        <SummaryCard
          title="Current Balance"
          amount={summary.balance}
          icon={Wallet}
          variant={summary.balance >= 0 ? 'balance' : 'expense'}
          subtitle="Net savings (Income - Expenses)"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-500">Daily financial activity timeline</p>
            </div>
          </div>
          <IncomeVsExpenseBarChart
            data={dashboardData?.incomeVsExpenses || []}
            loading={loading}
          />
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Expenses by Category
              </h3>
              <p className="text-xs text-slate-500">Monthly spending distribution</p>
            </div>
          </div>
          <ExpensePieChart
            data={dashboardData?.expenseBreakdown || []}
            loading={loading}
          />
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500">Your latest recorded financial entries</p>
          </div>
        </div>
        <RecentTransactionsTable
          transactions={dashboardData?.recentTransactions || []}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
