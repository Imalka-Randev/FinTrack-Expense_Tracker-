import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const SummaryCard = ({
  title,
  amount,
  icon: Icon,
  variant = 'neutral',
  subtitle,
}) => {
  const variantStyles = {
    income: {
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50 text-emerald-600',
      amountColor: 'text-emerald-700',
    },
    expense: {
      border: 'border-rose-100',
      iconBg: 'bg-rose-50 text-rose-600',
      amountColor: 'text-rose-700',
    },
    balance: {
      border: 'border-slate-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
      amountColor: 'text-slate-900',
    },
    neutral: {
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-600',
      amountColor: 'text-slate-900',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  return (
    <div
      className={`bg-white rounded-2xl p-6 border shadow-xs transition-shadow duration-150 hover:shadow-md ${currentVariant.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${currentVariant.iconBg}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${currentVariant.amountColor}`}>
          {formatCurrency(amount)}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
