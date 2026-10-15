import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { ALL_CATEGORIES } from '../../utils/constants';
import Select from '../common/Select';

export const TransactionFilters = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleInputChange = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.type ||
    filters.category ||
    filters.startDate ||
    filters.endDate;

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'expense', label: 'Expenses Only' },
    { value: 'income', label: 'Income Only' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...ALL_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Filter className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Filters & Search</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Search description..."
            className="w-full h-10 text-sm bg-white border border-slate-300 rounded-lg pl-9 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type || ''}
          onChange={(e) => handleInputChange('type', e.target.value)}
          options={typeOptions}
          size="md"
          fullWidth={false}
          className="w-36"
          aria-label="Filter by type"
        />

        {/* Category Filter */}
        <Select
          value={filters.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
          options={categoryOptions}
          size="md"
          fullWidth={false}
          className="w-44"
          aria-label="Filter by category"
        />

        {/* Date Range Start & End */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-[140px] sm:w-[145px] h-10 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-2.5 text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            title="Start date"
            aria-label="Start date"
          />
          <span className="text-slate-400 text-xs font-medium">to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-[140px] sm:w-[145px] h-10 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-2.5 text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            title="End date"
            aria-label="End date"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
