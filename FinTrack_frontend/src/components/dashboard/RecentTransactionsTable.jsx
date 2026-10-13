import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ArrowRight, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export const RecentTransactionsTable = ({ transactions = [] }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No Recent Transactions"
        description="Transactions you add will appear here automatically."
        className="border-none py-6"
      />
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3 text-right">Amount</th>
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
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                    {tx.category}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                    {tx.description || '—'}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge variant={isIncome ? 'income' : 'expense'}>
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold whitespace-nowrap">
                    <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden divide-y divide-slate-100">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          return (
            <div key={tx._id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
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
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {tx.category}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {tx.description || formatDate(tx.date)}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    isIncome ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatDate(tx.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link to transactions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          <span>View all transactions</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
