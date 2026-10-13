import React from 'react';
import { Edit2, Trash2, ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export const TransactionTable = ({
  transactions = [],
  onEdit,
  onDelete,
  onAddNew,
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions found"
        description="Try adjusting your filters or record a new transaction to get started."
        actionLabel="Add Transaction"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <tr
                  key={tx._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {tx.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {tx.description || '—'}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={isIncome ? 'income' : 'expense'}>
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold whitespace-nowrap">
                    <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        title="Edit transaction"
                        aria-label={`Edit transaction in ${tx.category}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                        title="Delete transaction"
                        aria-label={`Delete transaction in ${tx.category}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-100 p-2">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          return (
            <div
              key={tx._id}
              className="p-3 bg-white rounded-xl flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {tx.category}
                    </h4>
                    <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <div>
                    <Badge variant={isIncome ? 'income' : 'expense'} size="sm">
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </div>
                </div>
              </div>

              {tx.description && (
                <p className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  {tx.description}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onEdit(tx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(tx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTable;
