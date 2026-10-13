import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { EXPENSE_CATEGORIES, MONTHS } from '../../utils/constants';
import { DollarSign } from 'lucide-react';

export const BudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currentMonth,
  currentYear,
  loading = false,
}) => {
  const isEditing = !!initialData?._id;

  const [formData, setFormData] = useState(() => ({
    category: '',
    amount: '',
    month: currentMonth || new Date().getMonth() + 1,
    year: currentYear || new Date().getFullYear(),
  }));

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || '',
        amount: initialData.amount ? String(initialData.amount) : '',
        month: initialData.month || currentMonth || new Date().getMonth() + 1,
        year: initialData.year || currentYear || new Date().getFullYear(),
      });
    } else {
      setFormData({
        category: '',
        amount: '',
        month: currentMonth || new Date().getMonth() + 1,
        year: currentYear || new Date().getFullYear(),
      });
    }
    setErrors({});
    setSubmitError('');
  }, [initialData, isOpen, currentMonth, currentYear]);

  const validate = () => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Budget amount must be greater than 0';
    }

    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = 'A valid 4-digit year is required';
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
        category: formData.category.trim(),
        amount: parseFloat(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
      });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save budget plan');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={isEditing ? 'Edit Monthly Budget' : 'Set Category Budget'}
      description={
        isEditing
          ? 'Modify your spending ceiling for this category.'
          : 'Set a maximum monthly spending goal to control your expenses.'
      }
      maxWidth="max-w-md"
    >
      {submitError && (
        <ErrorMessage message={submitError} className="mb-5" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Category Dropdown */}
        <Select
          label="Expense Category"
          name="category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          options={EXPENSE_CATEGORIES}
          placeholder="Select an expense category"
          error={errors.category}
          required
          disabled={isEditing} // Backend prohibits changing category on update or handles amount
        />

        {/* Amount Input */}
        <Input
          label="Budget Limit Amount ($)"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, amount: e.target.value }))
          }
          placeholder="e.g. 500.00"
          icon={DollarSign}
          error={errors.amount}
          required
        />

        {/* Period selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Month <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.month}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, month: Number(e.target.value) }))
              }
              disabled={isEditing}
              className="block w-full rounded-lg text-sm bg-white border border-slate-300 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, year: Number(e.target.value) }))
              }
              disabled={isEditing}
              error={errors.year}
              required
            />
          </div>
        </div>

        {/* Actions */}
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
            {isEditing ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;
