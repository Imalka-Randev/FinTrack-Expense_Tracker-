import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, RefreshCw, PiggyBank } from 'lucide-react';
import budgetService from '../services/budgetService';
import { MONTHS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetModal from '../components/budgets/BudgetModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import useToast from '../hooks/useToast';

export const BudgetsPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete modal state
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await budgetService.getBudgets({
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });
      setBudgets(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const { showSuccess, showError } = useToast();

  // Handle Save (Create / Update)
  const handleSaveBudget = async (data) => {
    setModalLoading(true);
    try {
      if (editingBudget?._id) {
        // Backend update budget allows amount update
        await budgetService.updateBudget(editingBudget._id, {
          amount: data.amount,
        });
        showSuccess('Budget limit updated successfully');
      } else {
        await budgetService.createBudget(data);
        showSuccess('Budget limit established successfully');
      }
      setIsModalOpen(false);
      setEditingBudget(null);
      await fetchBudgets();
    } catch (err) {
      showError(err.message || 'Failed to save budget plan');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingBudget?._id) return;
    setDeleteLoading(true);
    try {
      await budgetService.deleteBudget(deletingBudget._id);
      showSuccess('Budget plan deleted successfully');
      setDeletingBudget(null);
      await fetchBudgets();
    } catch (err) {
      showError(err.message || 'Failed to delete budget');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculate aggregated budget stats
  const totalBudgetLimit = budgets.reduce(
    (sum, b) => sum + (b.budgetAmount || b.amount || 0),
    0
  );
  const totalSpent = budgets.reduce(
    (sum, b) => sum + (b.spentAmount || 0),
    0
  );
  const totalRemaining = totalBudgetLimit - totalSpent;

  const currentYearNum = new Date().getFullYear();
  const yearOptions = [
    currentYearNum - 1,
    currentYearNum,
    currentYearNum + 1,
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls & Month Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Budget Period
            </h2>
            <p className="text-xs text-slate-500">
              View and manage budgets for the selected month
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            options={MONTHS}
            size="md"
            fullWidth={false}
            className="w-36"
            aria-label="Select budget month"
          />

          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={yearOptions}
            size="md"
            fullWidth={false}
            className="w-28"
            aria-label="Select budget year"
          />

          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchBudgets}
            loading={loading}
            aria-label="Refresh budgets"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          >
            Set Budget
          </Button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Budgeted</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatCurrency(totalBudgetLimit)}
            </span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Spent</span>
            <span className="text-xl font-bold text-rose-600 mt-1 block">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Remaining</span>
            <span
              className={`text-xl font-bold mt-1 block ${
                totalRemaining < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatCurrency(totalRemaining)}
            </span>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <ErrorMessage
          title="Could not load budgets"
          message={error}
          onRetry={fetchBudgets}
        />
      )}

      {/* Content Grid / Empty State */}
      {loading && budgets.length === 0 ? (
        <LoadingSpinner message="Calculating your monthly budget targets..." />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No Budgets Configured"
          description={`You haven't established any category budgets for ${
            MONTHS.find((m) => m.value === selectedMonth)?.label
          } ${selectedYear}. Setting budgets helps you avoid overspending.`}
          actionLabel="Set Category Budget"
          onAction={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              onEdit={(budget) => {
                setEditingBudget(budget);
                setIsModalOpen(true);
              }}
              onDelete={(budget) => setDeletingBudget(budget)}
            />
          ))}
        </div>
      )}

      {/* Budget Create / Edit Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={handleSaveBudget}
        initialData={editingBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        description={`Are you sure you want to remove the budget for ${
          deletingBudget?.category || ''
        }? Your recorded transactions will not be deleted, but spending limits will no longer be tracked for this category.`}
        confirmText="Yes, Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default BudgetsPage;
