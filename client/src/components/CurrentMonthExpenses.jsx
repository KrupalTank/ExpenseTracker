import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';

export default function CurrentMonthExpenses({ currentMonthExpenses, onEdit, onDelete }) {
  const [expandedDates, setExpandedDates] = useState({});

  // Group expenses by date (YYYY-MM-DD)
  const groupedByDate = currentMonthExpenses.reduce((acc, exp) => {
    const dateKey = exp.expense_date.substring(0, 10);
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        totalAmount: 0,
        items: [],
      };
    }
    acc[dateKey].totalAmount += parseFloat(exp.amount);
    acc[dateKey].items.push(exp);
    return acc;
  }, {});

  const dateGroups = Object.values(groupedByDate).sort((a, b) => b.date.localeCompare(a.date));

  const toggleExpand = (dateStr) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-blue-600" />
        <span>આ મહિનાના ખર્ચ (Current Month Expenses)</span>
      </h3>

      <div className="space-y-2">
        {dateGroups.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            આ મહિનામાં હજી સુધી કોઈ ખર્ચ ઉમેરેલ નથી (No expenses this month)
          </p>
        ) : (
          dateGroups.map((group) => {
            const isExpanded = !!expandedDates[group.date];
            const titlesSummary = group.items.map((item) => item.title).join(', ');

            return (
              <div key={group.date} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(group.date)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                >
                  <div className="pr-3 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900">{group.date}</p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {titlesSummary}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-sm font-bold text-blue-700">
                      ₹{group.totalAmount.toFixed(2)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Item List */}
                {isExpanded && (
                  <div className="p-3 bg-white border-t border-slate-100 space-y-2">
                    {group.items.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs border border-slate-100"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{exp.title}</p>
                          <p className="text-slate-500">{exp.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">
                            ₹{parseFloat(exp.amount).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onEdit(exp)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(exp.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
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