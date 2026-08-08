import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as ChartIcon, Calendar } from 'lucide-react';
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

export default function CategoryChart({ token }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // 'all' or '01'-'12'
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
      // Calculate date range depending on whether "All Months" or a specific month is chosen
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

      // Group totals by Category
      const categoryMap = {};
      let sum = 0;

      expenses.forEach((exp) => {
        const amt = parseFloat(exp.amount);
        const cat = exp.category || 'General';
        // Clean up display category name
        const cleanCat = cat.split('/')[0].trim();

        categoryMap[cleanCat] = (categoryMap[cleanCat] || 0) + amt;
        sum += amt;
      });

      const formattedData = Object.keys(categoryMap).map((cat) => ({
        name: cat,
        value: categoryMap[cat],
      }));

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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <ChartIcon className="w-4 h-4 text-blue-600" />
          <span>કેટેગરી વાઈઝ એનાલિસિસ (Category Analysis)</span>
        </h3>
      </div>

      {/* Filter Selectors */}
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

      {/* Chart Display Container */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">લોડ થઈ રહ્યું છે... (Loading chart...)</div>
      ) : chartData.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          આ સમયગાળા માટે કોઈ ખર્ચ નથી (No expense data available for selected period)
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${val.toFixed(2)}`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Table List */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
              <span>Category Total:</span>
              <span className="text-blue-700">₹{totalSpent.toFixed(2)}</span>
            </div>
            {chartData.map((item, idx) => {
              const percentage = totalSpent > 0 ? ((item.value / totalSpent) * 100).toFixed(1) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="space-x-2 font-semibold">
                    <span className="text-slate-500">{percentage}%</span>
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