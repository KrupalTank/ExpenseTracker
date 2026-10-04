import React, { useState } from 'react';
import { Wallet, TrendingUp, CalendarDays, Plus, Edit2, X, Check } from 'lucide-react';
import axios from 'axios';

export default function SummaryCards({
  currentBalance,
  monthTotal,
  yearTotal,
  onOpenAddModal,
  token,
  onBalanceUpdated,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = () => {
    setNewBalanceInput(currentBalance !== undefined ? currentBalance.toString() : '0');
    setIsEditModalOpen(true);
  };

  const handleSaveBalance = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(newBalanceInput);
    if (isNaN(parsed)) return;

    setIsSaving(true);
    try {
      await axios.put(
        '/api/auth/balance',
        { balance: parsed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditModalOpen(false);
      if (onBalanceUpdated) onBalanceUpdated();
    } catch (err) {
      console.error('Failed to update balance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {/* Available Balance Card (Replaced Today) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center sm:text-left relative group">
          <div className="flex items-center justify-between space-x-1 text-slate-500 mb-1">
            <div className="flex items-center space-x-1">
              <Wallet className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium">બેલેન્સ (Balance)</span>
            </div>
            <button
              onClick={handleOpenEdit}
              className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
              title="Set/Edit Bank Balance"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <p className="text-base sm:text-lg font-bold text-blue-700 truncate">
            ₹{currentBalance !== undefined ? currentBalance.toFixed(2) : '0.00'}
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

      {/* Edit Balance Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span>બેલેન્સ બદલો (Update Balance)</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  નવું બેલેન્સ લખો (Enter Current Bank Balance)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm font-semibold"
                  placeholder="25000.00"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  રદ કરો (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'સાચવે છે...' : 'સાચવો (Save)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}