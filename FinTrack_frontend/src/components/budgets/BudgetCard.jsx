import React from 'react';
import { Edit2, Trash2, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import Badge from '../common/Badge';

export const BudgetCard = ({
  budget,
  onEdit,
  onDelete,
}) => {
  const {
    category,
    amount,
    budgetAmount = amount,
    spentAmount = 0,
    remainingAmount = budgetAmount - spentAmount,
    percentageUsed = (spentAmount / (budgetAmount || 1)) * 100,
    isExceeded = spentAmount > budgetAmount,
  } = budget;

  // Determine budget status
  let statusVariant = 'safe';
  let statusText = 'On Track';
  let statusColor = 'emerald';

  if (isExceeded || percentageUsed > 100) {
    statusVariant = 'exceeded';
    statusText = 'Exceeded';
    statusColor = 'rose';
  } else if (percentageUsed >= 80) {
    statusVariant = 'warning';
    statusText = 'Near Limit';
    statusColor = 'amber';
  }

  // Visual bar clamped between 0 and 100%
  const progressPercentClamped = Math.min(Math.max(percentageUsed, 0), 100);

  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 border shadow-xs transition-all hover:shadow-md ${
        isExceeded
          ? 'border-rose-200 ring-1 ring-rose-200/50'
          : 'border-slate-200/80'
      }`}
    >
      {/* Header: Category & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {category}
          </h3>
          <div className="mt-1">
            <Badge variant={statusVariant} size="sm">
              {statusText} ({formatPercentage(percentageUsed)})
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Edit budget limit"
            aria-label={`Edit ${category} budget`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete budget"
            aria-label={`Delete ${category} budget`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Spent: {formatCurrency(spentAmount)}</span>
          <span>Limit: {formatCurrency(budgetAmount)}</span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isExceeded
                ? 'bg-rose-500'
                : percentageUsed >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercentClamped}%` }}
            role="progressbar"
            aria-valuenow={percentageUsed}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400 block">Remaining</span>
          <span
            className={`font-bold text-sm ${
              remainingAmount < 0 ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {formatCurrency(remainingAmount)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-slate-400 block">Usage</span>
          <span
            className={`font-bold text-sm ${
              isExceeded
                ? 'text-rose-600'
                : percentageUsed >= 80
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {formatPercentage(percentageUsed)}
          </span>
        </div>
      </div>

      {/* Exceeded Warning Notice */}
      {isExceeded && (
        <div className="mt-3.5 p-2.5 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-2 text-xs text-rose-700 font-medium">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span>
            Budget exceeded by {formatCurrency(Math.abs(remainingAmount))}!
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
