import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#64748b', // slate
  '#14b8a6', // teal
  '#eab308', // yellow
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-slate-700">
        <p className="font-semibold">{data.category}</p>
        <p className="text-emerald-400 mt-0.5">
          {formatCurrency(data.amount)} ({formatPercentage(data.percentage)})
        </p>
      </div>
    );
  }
  return null;
};

export const ExpensePieChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
        Loading expense breakdown...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          icon={PieIcon}
          title="No Expense Data"
          description="Record expense transactions to see your category distribution."
          className="border-none py-6"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.category || index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span className="text-xs font-medium text-slate-700">
                  {value} ({formatPercentage(entry.payload?.percentage)})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpensePieChart;
