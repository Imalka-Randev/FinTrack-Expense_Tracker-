import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
          {message && (
            <p className="mt-1 text-sm text-rose-700 leading-relaxed">{message}</p>
          )}
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={onRetry}
                className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100/50"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
