import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Get started by creating your first record.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 ${className}`}
    >
      <div className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl mb-4">
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          icon={actionIcon}
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
