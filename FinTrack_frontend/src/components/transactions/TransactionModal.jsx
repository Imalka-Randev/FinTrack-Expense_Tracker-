import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../../utils/constants';
import { toInputDateFormat } from '../../utils/formatters';
import { DollarSign, Calendar, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const isEditing = !!initialData?._id;

  const [formData, setFormData] = useState(() => ({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: toInputDateFormat(new Date()),
  }));

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'expense',
        amount: initialData.amount ? String(initialData.amount) : '',
        category: initialData.category || '',
        description: initialData.description || '',
        date: toInputDateFormat(initialData.date),
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: toInputDateFormat(new Date()),
      });
    }
    setErrors({});
    setSubmitError('');
  }, [initialData, isOpen]);

  const categoryOptions =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validate = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Transaction type is required';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError('');
    try {
      await onSubmit({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
      });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save transaction');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={isEditing ? 'Edit Transaction' : 'Add New Transaction'}
      description={
        isEditing
          ? 'Update the details for this transaction record.'
          : 'Record a new income or expense transaction.'
      }
      maxWidth="max-w-lg"
    >
      {submitError && (
        <ErrorMessage message={submitError} className="mb-5" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Type Toggle Segmented Control */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Transaction Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  type: 'expense',
                  category: '', // Reset category if switching type
                }));
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                formData.type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  type: 'income',
                  category: '', // Reset category if switching type
                }));
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                formData.type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Income</span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <Input
          label="Amount ($)"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, amount: e.target.value }))
          }
          placeholder="0.00"
          icon={DollarSign}
          error={errors.amount}
          required
        />

        {/* Category Dropdown */}
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          options={categoryOptions}
          placeholder="Select category"
          error={errors.category}
          required
        />

        {/* Date Input */}
        <Input
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          icon={Calendar}
          error={errors.date}
          required
        />

        {/* Description Input */}
        <Input
          label="Description (Optional)"
          name="description"
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="e.g. Lunch with colleagues or Client payment"
          icon={FileText}
          helperText="Maximum 500 characters"
          maxLength={500}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {isEditing ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
