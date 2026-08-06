import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['General', 'Groceries / શાકભાજી', 'Bills / બિલ', 'Transport / ભાડું', 'Health / દવા', 'Entertainment', 'Food / ખાણીપીણી'];

export default function ExpenseFormModal({ isOpen, onClose, onSave, editingExpense, token }) {
  const getLocalToday = () => new Date().toLocaleDateString('en-CA');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [expenseDate, setExpenseDate] = useState(getLocalToday());
  const [suggestions, setSuggestions] = useState([]);

  // Fetch title & category suggestions on modal open
  useEffect(() => {
    if (isOpen && token) {
      axios.get('/api/expenses/suggestions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setSuggestions(res.data))
      .catch(err => console.error('Failed to load suggestions:', err));
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setAmount(editingExpense.amount || '');
      setCategory(editingExpense.category || 'General');
      const cleanDate = typeof editingExpense.expense_date === 'string' 
        ? editingExpense.expense_date.substring(0, 10) 
        : getLocalToday();
      setExpenseDate(cleanDate);
    } else {
      setTitle('');
      setAmount('');
      setCategory('General');
      setExpenseDate(getLocalToday());
    }
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  // Filter suggestions as user types
  const filteredSuggestions = title.trim() === ''
    ? suggestions.slice(0, 6)
    : suggestions.filter(s => s.title.toLowerCase().includes(title.toLowerCase())).slice(0, 6);

  const handleSelectSuggestion = (sugg) => {
    setTitle(sugg.title);
    if (sugg.category) {
      setCategory(sugg.category);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    onSave({
      id: editingExpense ? editingExpense.id : undefined,
      title,
      amount: parseFloat(amount),
      category,
      expense_date: expenseDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">
            {editingExpense ? 'ખર્ચ સુધારો (Edit Expense)' : 'નવો ખર્ચ (Add Expense)'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              વિગત (Description / Title)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. દૂધ શાકભાજી / Milk & Vegetables"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 min-h-[48px]"
            />

            {/* Auto Suggestions Chips */}
            {filteredSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 font-medium flex items-center space-x-1 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>ઝડપી પસંદગી (Quick Suggestions):</span>
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {filteredSuggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(sugg)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 text-xs font-medium rounded-full border border-slate-200 transition-colors"
                    >
                      {sugg.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">રકમ (Amount ₹)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">તારીખ (Date)</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">કેટેગરી (Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 min-h-[48px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 font-medium text-slate-700 rounded-xl hover:bg-slate-50 min-h-[48px]"
            >
              રદ કરો (Cancel)
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center space-x-1 min-h-[48px]"
            >
              <Check className="w-5 h-5" />
              <span>સેવ કરો (Save)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}