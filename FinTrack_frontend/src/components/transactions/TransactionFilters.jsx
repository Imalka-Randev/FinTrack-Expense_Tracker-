import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { ALL_CATEGORIES } from '../../utils/constants';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Search description..."
            className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filters.type || ''}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Start & End in compact flex */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Start date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="End date"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
