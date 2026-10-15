import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  RefreshCw,
  Plus,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import budgetService from '../services/budgetService';
import { MONTHS } from '../utils/constants';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import SummaryCard from '../components/dashboard/SummaryCard';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import IncomeVsExpenseBarChart from '../components/dashboard/IncomeVsExpenseBarChart';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export const DashboardPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [dashboardData, setDashboardData] = useState(null);
  const [prevDashboardData, setPrevDashboardData] = useState(null);
  const [monthBudgets, setMonthBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current month data
      const currentMonthData = await dashboardService.getDashboard({
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });
      setDashboardData(currentMonthData);

      // 2. Fetch previous month data for comparison insights
      const prevMonth = Number(selectedMonth) === 1 ? 12 : Number(selectedMonth) - 1;
      const prevYear = Number(selectedMonth) === 1 ? Number(selectedYear) - 1 : Number(selectedYear);

      try {
        const prevData = await dashboardService.getDashboard({
          month: prevMonth,
          year: prevYear,
        });
        setPrevDashboardData(prevData);
      } catch (err) {
        console.warn('Could not fetch previous month comparison:', err);
        setPrevDashboardData(null);
      }

      // 3. Fetch current month budgets for spending alerts
      try {
        const budgetsData = await budgetService.getBudgets({
          month: Number(selectedMonth),
          year: Number(selectedYear),
        });
        setMonthBudgets(budgetsData || []);
      } catch (err) {
        console.warn('Could not fetch month budgets:', err);
        setMonthBudgets([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Year options
  const currentYearNum = new Date().getFullYear();
  const yearOptions = [
    currentYearNum - 2,
    currentYearNum - 1,
    currentYearNum,
    currentYearNum + 1,
  ];

  const summary = useMemo(() => dashboardData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  }, [dashboardData]);

  const prevSummary = useMemo(() => prevDashboardData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  }, [prevDashboardData]);

  // Month-over-Month Comparison Calculations
  const comparisonInsights = useMemo(() => {
    let expenseChangeText = null;
    let expenseTrendingUp = false;
    if (prevSummary.totalExpenses > 0) {
      const diff = summary.totalExpenses - prevSummary.totalExpenses;
      const pct = Math.abs((diff / prevSummary.totalExpenses) * 100).toFixed(1);
      expenseTrendingUp = diff > 0;
      expenseChangeText = `${expenseTrendingUp ? '↑' : '↓'} ${pct}% vs previous month`;
    }

    let incomeChangeText = null;
    let incomeTrendingUp = false;
    if (prevSummary.totalIncome > 0) {
      const diff = summary.totalIncome - prevSummary.totalIncome;
      const pct = Math.abs((diff / prevSummary.totalIncome) * 100).toFixed(1);
      incomeTrendingUp = diff > 0;
      incomeChangeText = `${incomeTrendingUp ? '↑' : '↓'} ${pct}% vs previous month`;
    }

    // Top spending category
    const topCategory = dashboardData?.expenseBreakdown?.[0] || null;

    // Budget alerts
    const exceededBudgets = monthBudgets.filter((b) => b.isExceeded || b.percentageUsed > 100);
    const nearLimitBudgets = monthBudgets.filter(
      (b) => b.percentageUsed >= 80 && !b.isExceeded && b.percentageUsed <= 100
    );

    return {
      expenseChangeText,
      expenseTrendingUp,
      incomeChangeText,
      incomeTrendingUp,
      topCategory,
      exceededBudgets,
      nearLimitBudgets,
    };
  }, [summary, prevSummary, dashboardData, monthBudgets]);

  const selectedMonthName = MONTHS.find((m) => m.value === selectedMonth)?.label;

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

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            options={MONTHS}
            size="md"
            fullWidth={false}
            className="w-36"
            aria-label="Select month"
          />

          {/* Year Selector */}
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={yearOptions}
            size="md"
            fullWidth={false}
            className="w-28"
            aria-label="Select year"
          />

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

      {/* Budget Approaching or Exceeded Alerts */}
      {comparisonInsights.exceededBudgets.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-xs flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Budget Exceeded in {comparisonInsights.exceededBudgets.length} Categor{comparisonInsights.exceededBudgets.length === 1 ? 'y' : 'ies'}!
              </h4>
              <p className="mt-0.5 text-xs text-rose-700">
                You have exceeded spending targets in:{' '}
                <span className="font-semibold">
                  {comparisonInsights.exceededBudgets.map((b) => `${b.category} (${formatCurrency(b.spentAmount)} / ${formatCurrency(b.budgetAmount)})`).join(', ')}
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/budgets"
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 hover:underline shrink-0"
          >
            <span>Review Budgets</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {comparisonInsights.exceededBudgets.length === 0 && comparisonInsights.nearLimitBudgets.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-xs flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Spending Approaching Limit
              </h4>
              <p className="mt-0.5 text-xs text-amber-800">
                {comparisonInsights.nearLimitBudgets.map((b) => `${b.category} is at ${formatPercentage(b.percentageUsed)} of limit`).join(', ')}
              </p>
            </div>
          </div>
          <Link
            to="/budgets"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline shrink-0"
          >
            <span>Adjust Budgets</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
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
          subtitle={
            comparisonInsights.incomeChangeText ? (
              <span className={`inline-flex items-center gap-1 font-semibold ${comparisonInsights.incomeTrendingUp ? 'text-emerald-600' : 'text-slate-500'}`}>
                {comparisonInsights.incomeChangeText}
              </span>
            ) : (
              `Recorded in ${selectedMonthName}`
            )
          }
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary.totalExpenses}
          icon={TrendingDown}
          variant="expense"
          subtitle={
            comparisonInsights.expenseChangeText ? (
              <span className={`inline-flex items-center gap-1 font-semibold ${comparisonInsights.expenseTrendingUp ? 'text-rose-600' : 'text-emerald-600'}`}>
                {comparisonInsights.expenseChangeText}
              </span>
            ) : (
              `Recorded in ${selectedMonthName}`
            )
          }
        />
        <SummaryCard
          title="Current Balance"
          amount={summary.balance}
          icon={Wallet}
          variant={summary.balance >= 0 ? 'balance' : 'expense'}
          subtitle="Net savings (Income - Expenses)"
        />
      </div>

      {/* Financial Highlight Insight Banner */}
      {comparisonInsights.topCategory && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
                Highest Spending Category ({selectedMonthName})
              </p>
              <h4 className="text-base font-bold mt-0.5">
                {comparisonInsights.topCategory.category} — {formatCurrency(comparisonInsights.topCategory.amount)} ({comparisonInsights.topCategory.percentage.toFixed(1)}% of total expenses)
              </h4>
            </div>
          </div>
          <Link
            to={`/reports`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors self-start sm:self-auto"
          >
            <span>View Full Statement</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

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
