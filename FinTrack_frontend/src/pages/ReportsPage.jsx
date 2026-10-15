import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';
import transactionService from '../services/transactionService';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportTransactionsToCSV, printReport } from '../utils/exportUtils';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';

export const ReportsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Helper to get formatted local date YYYY-MM-DD
  const formatYYYYMMDD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Default to First Day of Current Month -> Today
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: formatYYYYMMDD(firstDay),
      endDate: formatYYYYMMDD(now),
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates);
  const [activePreset, setActivePreset] = useState('this-month');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick Preset Handlers
  const applyPreset = (presetKey) => {
    const now = new Date();
    setActivePreset(presetKey);

    switch (presetKey) {
      case 'this-month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        setDateRange({
          startDate: formatYYYYMMDD(firstDay),
          endDate: formatYYYYMMDD(now),
        });
        break;
      }
      case 'last-month': {
        const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
        setDateRange({
          startDate: formatYYYYMMDD(firstDayPrev),
          endDate: formatYYYYMMDD(lastDayPrev),
        });
        break;
      }
      case 'last-30-days': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        setDateRange({
          startDate: formatYYYYMMDD(thirtyDaysAgo),
          endDate: formatYYYYMMDD(now),
        });
        break;
      }
      case 'year-to-date': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        setDateRange({
          startDate: formatYYYYMMDD(startOfYear),
          endDate: formatYYYYMMDD(now),
        });
        break;
      }
      case 'all-time': {
        setDateRange({
          startDate: '',
          endDate: '',
        });
        break;
      }
      default:
        break;
    }
  };

  // Fetch transactions for date range
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransactions({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve statement data for this period.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Financial Calculations & Category Aggregations
  const reportSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpenseMap = {};
    let incomeCount = 0;
    let expenseCount = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
        incomeCount += 1;
      } else {
        totalExpenses += amt;
        expenseCount += 1;

        const cat = tx.category || 'Uncategorized';
        if (!categoryExpenseMap[cat]) {
          categoryExpenseMap[cat] = {
            category: cat,
            amount: 0,
            count: 0,
          };
        }
        categoryExpenseMap[cat].amount += amt;
        categoryExpenseMap[cat].count += 1;
      }
    });

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

    // Convert category map to array, calculate shares, and sort descending
    const categoryBreakdown = Object.values(categoryExpenseMap)
      .map((item) => ({
        ...item,
        percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate,
      transactionCount: transactions.length,
      incomeCount,
      expenseCount,
      categoryBreakdown,
    };
  }, [transactions]);

  // Handle CSV Export
  const handleExportCSV = () => {
    try {
      const filename = exportTransactionsToCSV(
        transactions,
        `fintrack-report-${dateRange.startDate || 'start'}-to-${dateRange.endDate || 'end'}`
      );
      showSuccess(`Exported ${transactions.length} transactions to ${filename}`);
    } catch (err) {
      showError(err.message || 'Could not export CSV');
    }
  };

  // Handle Print / PDF
  const handlePrint = () => {
    printReport();
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PRINT HEADER (Visible ONLY on print / PDF output)
         ========================================================================= */}
      <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-900">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FinTrack Financial Statement</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automated Financial Report & Itemized Statement</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{user?.name || 'Account Holder'}</p>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Statement Period: </span>
            {dateRange.startDate ? formatDate(dateRange.startDate) : 'Beginning'} to{' '}
            {dateRange.endDate ? formatDate(dateRange.endDate) : 'Present'}
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800">Generated: </span>
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE CONTROLS BAR (Hidden during print)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Report Parameters</h2>
              <p className="text-xs text-slate-500">Select date range for financial calculations and exports</p>
            </div>
          </div>

          {/* Action Buttons: Export CSV & Print PDF */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
            <Button
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={handleExportCSV}
              disabled={loading || transactions.length === 0}
              className="w-full sm:w-auto justify-center"
            >
              Export CSV
            </Button>

            <Button
              variant="primary"
              icon={Printer}
              onClick={handlePrint}
              disabled={loading || transactions.length === 0}
              className="w-full sm:w-auto justify-center"
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Date Filters & Presets Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Presets:</span>
            {[
              { id: 'this-month', label: 'This Month' },
              { id: 'last-month', label: 'Last Month' },
              { id: 'last-30-days', label: 'Last 30 Days' },
              { id: 'year-to-date', label: 'Year to Date' },
              { id: 'all-time', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activePreset === p.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all flex-1 sm:w-48 shadow-xs">
              <label htmlFor="report-start-date" className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
                From:
              </label>
              <input
                id="report-start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => {
                  setActivePreset('custom');
                  setDateRange((prev) => ({ ...prev, startDate: e.target.value }));
                }}
                className="w-full min-w-0 text-xs bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all flex-1 sm:w-48 shadow-xs">
              <label htmlFor="report-end-date" className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
                To:
              </label>
              <input
                id="report-end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => {
                  setActivePreset('custom');
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }));
                }}
                className="w-full min-w-0 text-xs bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <ErrorMessage
          title="Could not load report data"
          message={error}
          onRetry={fetchReportData}
        />
      )}

      {/* Loading Spinner */}
      {loading && transactions.length === 0 && (
        <LoadingSpinner message="Compiling financial statement and aggregates..." />
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="No Transactions in Date Range"
          description="There are no income or expense records found for the selected period. Try adjusting your start and end dates."
          className="print:border-none"
        />
      )}

      {/* =========================================================================
          EXECUTIVE SUMMARY STATS (Included in Screen & Print)
         ========================================================================= */}
      {transactions.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Income */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs print:border-slate-300 print:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Income</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl print:hidden">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600">
                {formatCurrency(reportSummary.totalIncome)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {reportSummary.incomeCount} transaction{reportSummary.incomeCount === 1 ? '' : 's'}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs print:border-slate-300 print:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expenses</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl print:hidden">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600">
                {formatCurrency(reportSummary.totalExpenses)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {reportSummary.expenseCount} transaction{reportSummary.expenseCount === 1 ? '' : 's'}
              </p>
            </div>

            {/* Net Balance */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs print:border-slate-300 print:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Balance</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl print:hidden">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p
                className={`mt-2 text-xl sm:text-2xl font-bold ${
                  reportSummary.netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(reportSummary.netBalance)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Net savings over period</p>
            </div>

            {/* Savings Rate */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs print:border-slate-300 print:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Savings Rate</span>
                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl print:hidden">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p
                className={`mt-2 text-xl sm:text-2xl font-bold ${
                  Number(reportSummary.savingsRate) >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}
              >
                {reportSummary.savingsRate}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {reportSummary.transactionCount} total records
              </p>
            </div>
          </div>

          {/* =========================================================================
              CATEGORY EXPENSE BREAKDOWN (Table & Share)
             ========================================================================= */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs print:border-slate-300 print:shadow-none">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 print:border-slate-300">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600 print:hidden" />
                <h3 className="text-base font-bold text-slate-900">Expense Totals by Category</h3>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {reportSummary.categoryBreakdown.length} categor{reportSummary.categoryBreakdown.length === 1 ? 'y' : 'ies'}
              </span>
            </div>

            {reportSummary.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-slate-500 py-3 text-center">No expense transactions recorded in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Transactions</th>
                      <th className="py-2.5 px-3">Spending Share</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                    {reportSummary.categoryBreakdown.map((cat) => (
                      <tr key={cat.category} className="hover:bg-slate-50/70 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{cat.category}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500 text-xs">{cat.count}</td>
                        <td className="py-2.5 px-3 min-w-[140px]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden print:border print:border-slate-300">
                              <div
                                className="h-full bg-emerald-500 rounded-full print:bg-slate-600"
                                style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-12 text-right">
                              {cat.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(cat.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50/50 print:bg-transparent">
                      <td className="py-3 px-3">Total Spending</td>
                      <td className="py-3 px-3 text-center">{reportSummary.expenseCount}</td>
                      <td className="py-3 px-3 text-right text-xs text-slate-500">100.0%</td>
                      <td className="py-3 px-3 text-right text-rose-600">{formatCurrency(reportSummary.totalExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* =========================================================================
              ITEMIZED STATEMENT TABLE (Complete transactions in range)
             ========================================================================= */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs print:border-slate-300 print:shadow-none">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 print:border-slate-300">
              <h3 className="text-base font-bold text-slate-900">Itemized Transactions</h3>
              <span className="text-xs text-slate-500">{transactions.length} records in period</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 print:bg-transparent">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/70 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-xs">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge variant={isIncome ? 'income' : 'expense'} size="sm">
                            {isIncome ? 'Income' : 'Expense'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap text-xs">
                          {tx.category}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-xs max-w-xs truncate">
                          {tx.description || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap text-xs">
                          <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Print Footer Notice */}
            <div className="hidden print:block mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-400">
              FinTrack — Personal Expense & Budget Tracker • Confidential Financial Report
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
