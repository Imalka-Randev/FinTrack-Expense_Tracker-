import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';
import { BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-slate-700">
        <p className="font-semibold mb-1 text-slate-300">{label}</p>
        {payload.map((item) => (
          <p
            key={item.name}
            className={`flex items-center justify-between gap-4 font-medium ${
              item.name === 'Income' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>{item.name}:</span>
            <span>{formatCurrency(item.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const IncomeVsExpenseBarChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
        Loading activity chart...
      </div>
    );
  }

  // Format data labels (e.g. "2026-10-05" -> "Oct 5")
  const formattedData = data.map((d) => {
    let label = d.date;
    try {
      const parts = d.date.split('-');
      if (parts.length === 3) {
        label = `Day ${parseInt(parts[2], 10)}`;
      }
    } catch {
      label = d.date;
    }
    return {
      ...d,
      displayDate: label,
      Income: d.income,
      Expenses: d.expense,
    };
  });

  const hasActivity = formattedData.some((d) => d.Income > 0 || d.Expenses > 0);

  if (!hasActivity) {
    return (
      <div className="py-6">
        <EmptyState
          icon={BarChart3}
          title="No Activity Yet"
          description="Transactions recorded this month will appear on your activity timeline."
          className="border-none py-6"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs font-medium text-slate-600">{value}</span>
              )}
            />
            <Bar
              dataKey="Income"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="Expenses"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeVsExpenseBarChart;
