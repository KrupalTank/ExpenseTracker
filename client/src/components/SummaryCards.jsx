import React from 'react';
import { Calendar, TrendingUp, CalendarDays, Plus } from 'lucide-react';

export default function SummaryCards({ todayTotal, monthTotal, yearTotal, onOpenAddModal }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {/* Today's Spend */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1 text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-medium">આજ (Today)</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
            ₹{todayTotal ? todayTotal.toFixed(2) : '0.00'}
          </p>
        </div>

        {/* Current Month Spend */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1 text-slate-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">મહિનો (Month)</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
            ₹{monthTotal ? monthTotal.toFixed(2) : '0.00'}
          </p>
        </div>

        {/* Current Year Spend */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1 text-slate-500 mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[11px] font-medium">વર્ષ (Year)</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
            ₹{yearTotal ? yearTotal.toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Primary Mobile Action Button */}
      <button
        onClick={onOpenAddModal}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all min-h-[48px]"
      >
        <Plus className="w-5 h-5" />
        <span>નવો ખર્ચ ઉમેરો (Add Expense)</span>
      </button>
    </div>
  );
}