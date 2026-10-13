import React from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-1.5 font-semibold',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    income: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    expense: 'bg-rose-50 text-rose-700 border border-rose-200',
    safe: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    exceeded: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  // Default icons for specific variants if not explicitly supplied
  let DefaultIcon = Icon;
  if (!DefaultIcon) {
    if (variant === 'income') DefaultIcon = ArrowDownLeft;
    else if (variant === 'expense') DefaultIcon = ArrowUpRight;
    else if (variant === 'safe') DefaultIcon = CheckCircle2;
    else if (variant === 'warning') DefaultIcon = AlertTriangle;
    else if (variant === 'exceeded') DefaultIcon = AlertOctagon;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {DefaultIcon && <DefaultIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
