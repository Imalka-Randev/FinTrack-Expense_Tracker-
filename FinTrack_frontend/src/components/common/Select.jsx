import React, { useId, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

/**
 * Universal custom Select / Dropdown component.
 * Provides identical cross-browser rendering across Chrome, Safari, Firefox, and Edge.
 * Eliminates macOS Safari's native popover placement and renders a smooth dropdown directly beneath the trigger.
 */
export const Select = ({
  label,
  id: providedId,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  selectClassName = '',
  size = 'md',
  align = 'left',
  fullWidth = true,
  chevronInline = false,
  icon: Icon,
  'aria-label': ariaLabel,
  ...props
}) => {
  const generatedId = useId();
  const selectId = providedId || (name ? `select-${name}` : generatedId);
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Normalize options array into { value, label, disabled }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : String(opt.value),
        disabled: !!opt.disabled,
      };
    }
    return {
      value: opt,
      label: String(opt),
      disabled: false,
    };
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Display label
  const displayLabel = selectedOption
    ? selectedOption.label
    : (placeholder || 'Select...');

  const isPlaceholder = !selectedOption && !!placeholder;

  // Handle option selection
  const handleSelect = (optValue) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      onChange({
        target: {
          name,
          value: optValue,
        },
      });
    }
    triggerRef.current?.focus();
  };

  // Close on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };

    const handleGlobalKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen, onBlur]);

  // Scroll active item into view when menu opens
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const activeEl = menuRef.current.querySelector('[aria-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < normalizedOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(normalizedOptions.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : normalizedOptions.length - 1
        );
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        const option = normalizedOptions[highlightedIndex];
        if (!option.disabled) {
          handleSelect(option.value);
        }
      }
    } else if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  // Size styling tokens
  const sizeClasses = {
    sm: 'h-9 px-3 text-xs sm:text-sm',
    md: 'h-10 px-3.5 text-sm',
    lg: 'h-12 px-4 text-base',
  }[size] || 'h-10 px-3.5 text-sm';

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      {/* Hidden input for form data serialization */}
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full flex items-center ${
            chevronInline ? 'justify-start' : 'justify-between'
          } gap-2 rounded-lg border transition-all duration-150 font-medium select-none ${sizeClasses} ${
            disabled
              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
              : error
              ? 'bg-white border-rose-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500'
              : isOpen
              ? 'bg-white border-emerald-500 ring-2 ring-emerald-100 text-slate-900 shadow-xs'
              : 'bg-white hover:bg-slate-50/80 border-slate-300 text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500'
          } ${selectClassName}`}
          {...props}
        >
          <div className="flex items-center gap-2 truncate">
            {Icon && (
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  disabled ? 'text-slate-300' : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`truncate text-left ${
                isPlaceholder ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
              }`}
            >
              {displayLabel}
            </span>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={label || ariaLabel || name}
            className={`absolute ${
              align === 'right' ? 'right-0' : 'left-0'
            } top-full mt-1.5 z-50 ${
              fullWidth ? 'w-full min-w-[140px]' : 'min-w-[150px]'
            } max-h-60 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl ring-1 ring-slate-900/5 py-1.5 text-slate-800 animate-in fade-in zoom-in-95 duration-150 ease-out`}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3.5 py-2.5 text-xs text-slate-400 text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = highlightedIndex === index;

                return (
                  <button
                    key={`${opt.value}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    } ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error ? (
        <p
          id={errorId}
          className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
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

export default Select;
