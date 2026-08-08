import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { PieChart as ChartIcon, BarChart3, Donut } from 'lucide-react';
import axios from 'axios';

const COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

// const COLORS = [
//   '#4f46e5', // Indigo-600
//   '#10b981', // Emerald-500
//   '#f59e0b', // Amber-500
//   '#ec4899', // Pink-500
//   '#06b6d4', // Cyan-500
//   '#8b5cf6', // Purple-500
//   '#f97316', // Orange-500
//   '#64748b', // Slate-500
// ];

// const COLORS = [
//   '#3b82f6', // Bright Blue
//   '#14b8a6', // Teal
//   '#f43f5e', // Rose
//   '#a855f7', // Violet
//   '#eab308', // Yellow/Gold
//   '#0284c7', // Sky Blue
//   '#fb923c', // Warm Peach
//   '#475569', // Cool Gray
// ];

export default function CategoryChart({ token }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'donut'
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);

  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const months = [
    { value: 'all', label: 'All Months (આખા વર્ષનું)' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    fetchChartData();
  }, [selectedYear, selectedMonth]);

  const fetchChartData = async () => {
    if (!token) return;
    setLoading(true);

    try {
      let startDate, endDate;

      if (selectedMonth === 'all') {
        startDate = `${selectedYear}-01-01`;
        endDate = `${selectedYear}-12-31`;
      } else {
        const lastDay = new Date(selectedYear, parseInt(selectedMonth), 0).getDate();
        startDate = `${selectedYear}-${selectedMonth}-01`;
        endDate = `${selectedYear}-${selectedMonth}-${lastDay}`;
      }

      const res = await axios.get(
        `/api/expenses/range?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const expenses = res.data.expenses || [];
      const categoryMap = {};
      let sum = 0;

      expenses.forEach((exp) => {
        const amt = parseFloat(exp.amount);
        const cat = exp.category || 'General';
        const cleanCat = cat.split('/')[0].trim();

        categoryMap[cleanCat] = (categoryMap[cleanCat] || 0) + amt;
        sum += amt;
      });

      const formattedData = Object.keys(categoryMap)
        .map((cat) => ({
          name: cat,
          value: categoryMap[cat],
        }))
        .sort((a, b) => b.value - a.value);

      setChartData(formattedData);
      setTotalSpent(sum);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Header & Chart View Switcher */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <ChartIcon className="w-4 h-4 text-blue-600" />
          <span>કેટેગરી પૃથક્કરણ (Category Analysis)</span>
        </h3>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-all ${
              chartType === 'bar' ? 'bg-white shadow text-blue-600' : 'text-slate-500'
            }`}
            title="Vertical Bar View"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`p-1.5 rounded-md transition-all ${
              chartType === 'donut' ? 'bg-white shadow text-blue-600' : 'text-slate-500'
            }`}
            title="Donut View"
          >
            <Donut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Selectors */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">વર્ષ (Year)</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-800 bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">મહિનો (Month)</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-800 bg-white"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Interactive Chart */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">લોડ થઈ રહ્યું છે... (Loading...)</div>
      ) : chartData.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          આ સમયગાળા માટે કોઈ ડેટા મળ્યો નથી (No expenses in this period)
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                /* Vertical Bar Chart */
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#475569' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#475569' }}
                  />
                  <Tooltip
                    formatter={(val) => `₹${val.toFixed(2)}`}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                /* Donut Chart View */
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `₹${val.toFixed(2)}`}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Itemized List */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
              <span>કુલ ખર્ચ (Total Category Spend):</span>
              <span className="text-blue-700">₹{totalSpent.toFixed(2)}</span>
            </div>

            {chartData.map((item, idx) => {
              const percentage = totalSpent > 0 ? ((item.value / totalSpent) * 100).toFixed(1) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="space-x-3 font-semibold">
                    <span className="text-slate-400">{percentage}%</span>
                    <span className="text-slate-900">₹{item.value.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}