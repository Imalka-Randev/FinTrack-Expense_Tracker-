import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import transactionService from '../services/transactionService';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionModal from '../components/transactions/TransactionModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import useToast from '../hooks/useToast';

export const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete modal state
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransactions(filters);
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle ?add=true from external links (e.g. Dashboard)
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditingTransaction(null);
      setIsModalOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { showSuccess, showError } = useToast();

  // Handle Add / Edit Submission
  const handleSaveTransaction = async (data) => {
    setModalLoading(true);
    try {
      if (editingTransaction?._id) {
        await transactionService.updateTransaction(editingTransaction._id, data);
        showSuccess('Transaction updated successfully');
      } else {
        await transactionService.createTransaction(data);
        showSuccess('Transaction recorded successfully');
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      await fetchTransactions();
    } catch (err) {
      showError(err.message || 'Failed to save transaction');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingTransaction?._id) return;
    setDeleteLoading(true);
    try {
      await transactionService.deleteTransaction(deletingTransaction._id);
      showSuccess('Transaction deleted successfully');
      setDeletingTransaction(null);
      await fetchTransactions();
    } catch (err) {
      showError(err.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Transaction History
          </h2>
          <p className="text-sm text-slate-500">
            Review, filter, and manage all your income and expenses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchTransactions}
            loading={loading}
            aria-label="Refresh transaction records"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter Component */}
      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Error Notice */}
      {error && (
        <ErrorMessage
          title="Could not load transactions"
          message={error}
          onRetry={fetchTransactions}
        />
      )}

      {/* Main Table or Loading State */}
      {loading && transactions.length === 0 ? (
        <LoadingSpinner message="Loading your transactions..." />
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsModalOpen(true);
          }}
          onDelete={(tx) => setDeletingTransaction(tx)}
          onAddNew={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Create / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description={`Are you sure you want to permanently delete this ${
          deletingTransaction?.type || ''
        } transaction of $${deletingTransaction?.amount || 0}? This action cannot be reversed.`}
        confirmText="Yes, Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TransactionsPage;
