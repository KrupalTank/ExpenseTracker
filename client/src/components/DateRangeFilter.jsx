import React, { useState } from 'react';
import { Filter, FileText, Trash2, Edit } from 'lucide-react';
import { generatePDFReport } from '../utils/pdfGenerator';

export default function DateRangeFilter({ onFetchRange, rangeData, onEdit, onDelete }) {
  const getLocalToday = () => new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState(getLocalToday());
  const [endDate, setEndDate] = useState(getLocalToday());

  const handleFilter = (e) => {
    e.preventDefault();
    onFetchRange(startDate, endDate);
  };

  const handleDownloadPDF = () => {
    if (rangeData && rangeData.expenses) {
      generatePDFReport(rangeData.expenses, startDate, endDate);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
        <Filter className="w-4 h-4 text-blue-600" />
        <span>તારીખ પ્રમાણે ફિલ્ટર (Date Range Query)</span>
      </h3>

      <form onSubmit={handleFilter} className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">From Date</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">To Date</label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
          />
        </div>

        <button
          type="submit"
          className="col-span-2 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 text-sm"
        >
          શોધો (Calculate Expenses)
        </button>
      </form>

      {/* Filter Results Display */}
      {rangeData && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div>
              <p className="text-xs text-blue-600 font-medium">કુલ ખર્ચ (Total Expenses)</p>
              <p className="text-lg font-bold text-blue-900">₹{rangeData.total ? rangeData.total.toFixed(2) : '0.00'}</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={!rangeData.expenses || rangeData.expenses.length === 0}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg flex items-center space-x-1"
            >
              <FileText className="w-4 h-4" />
              <span>PDF Report</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {rangeData.expenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">કોઈ ખર્ચ મળ્યો નથી (No expenses in range)</p>
            ) : (
              rangeData.expenses.map((exp) => (
                <div key={exp.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                  <div className="pr-2">
                    <p className="text-sm font-semibold text-slate-800">{exp.title}</p>
                    <p className="text-xs text-slate-500">{exp.expense_date.substring(0, 10)} • {exp.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">₹{parseFloat(exp.amount).toFixed(2)}</span>
                    <button onClick={() => onEdit(exp)} className="p-1 text-slate-400 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(exp.id)} className="p-1 text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}