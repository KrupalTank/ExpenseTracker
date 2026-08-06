import React, { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function MonthlyHistory({ historySummary, onEdit, onDelete }) {
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [monthDetails, setMonthDetails] = useState({});
  const [loadingMonth, setLoadingMonth] = useState(null);

  // Invalidate cache when parent data updates
  useEffect(() => {
    setMonthDetails({});
  }, [historySummary]);

  const fetchMonthData = async (monthKey) => {
    setLoadingMonth(monthKey);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/expenses/history/month/${monthKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthDetails((prev) => ({ ...prev, [monthKey]: res.data.expenses }));
    } catch (err) {
      console.error('Error fetching month details:', err);
    } finally {
      setLoadingMonth(null);
    }
  };

  const toggleMonth = async (monthKey) => {
    if (expandedMonth === monthKey) {
      setExpandedMonth(null);
      return;
    }

    setExpandedMonth(monthKey);
    fetchMonthData(monthKey);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
        <History className="w-4 h-4 text-blue-600" />
        <span>પાછલા મહિનાનો હિસાબ (Monthly History)</span>
      </h3>

      <div className="space-y-2">
        {historySummary.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">હજુ સુધી હિસાબ નોંધાયેલ નથી (No history found)</p>
        ) : (
          historySummary.map((item) => {
            const isExpanded = expandedMonth === item.month_key;
            const items = monthDetails[item.month_key] || [];

            return (
              <div key={item.month_key} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleMonth(item.month_key)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.month_label}</p>
                    <p className="text-xs text-slate-500">{item.transaction_count} એન્ટ્રીઓ (entries)</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-blue-700">₹{parseFloat(item.total_amount).toFixed(2)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-3 bg-white border-t border-slate-100 space-y-2">
                    {loadingMonth === item.month_key ? (
                      <p className="text-xs text-slate-400 py-2 text-center">લોડ થઈ રહ્યું છે... (Loading...)</p>
                    ) : items.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 text-center">કોઈ ખર્ચ નથી (No entries)</p>
                    ) : (
                      items.map((exp) => (
                        <div key={exp.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs border border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">{exp.title}</p>
                            <p className="text-slate-500">{exp.expense_date.substring(0, 10)} • {exp.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">₹{parseFloat(exp.amount).toFixed(2)}</span>
                            <button onClick={() => onEdit(exp)} className="p-1 text-slate-400 hover:text-blue-600">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDelete(exp.id)} className="p-1 text-slate-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}