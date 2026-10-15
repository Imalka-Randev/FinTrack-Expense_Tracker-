import React, { useId, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  id: providedId,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  inputClassName = '',
  showPasswordToggle = true,
  ...props
}) => {
  const generatedId = useId();
  const inputId = providedId || (name ? `input-${name}` : generatedId);
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = isPassword && showPassword ? 'text' : type;

  // Determine right padding depending on presence of eye toggle and error icon
  const hasRightIcons = error || (isPassword && showPasswordToggle);
  let rightPadding = 'pr-3.5';
  if (error && isPassword && showPasswordToggle) {
    rightPadding = 'pr-16';
  } else if (hasRightIcons) {
    rightPadding = 'pr-10';
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`block w-full rounded-lg text-sm text-slate-900 border transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightPadding} py-2.5 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
          } ${inputClassName}`}
          {...props}
        />

        {hasRightIcons && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {error && (
              <div className="text-rose-500 pointer-events-none" title={error}>
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
              </div>
            )}

            {isPassword && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={disabled}
                className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-700 p-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1.5 text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
