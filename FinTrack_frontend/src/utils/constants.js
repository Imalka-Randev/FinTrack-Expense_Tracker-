export const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense', color: 'rose' },
  { value: 'income', label: 'Income', color: 'emerald' },
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Housing',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Personal Care',
  'Travel',
  'Debt & Loans',
  'Other Expense',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Bonus',
  'Gift',
  'Rental Income',
  'Other Income',
];

export const ALL_CATEGORIES = [
  ...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]),
];

export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];
