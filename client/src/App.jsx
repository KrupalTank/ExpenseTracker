import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import CurrentMonthExpenses from './components/CurrentMonthExpenses';
import MonthlyHistory from './components/MonthlyHistory';
import DateRangeFilter from './components/DateRangeFilter';
import ExpenseFormModal from './components/ExpenseFormModal';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);

  // Login Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard Data
  const [summary, setSummary] = useState({ todayTotal: 0, monthTotal: 0, yearTotal: 0 });
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState([]);
  const [historySummary, setHistorySummary] = useState([]);
  const [rangeData, setRangeData] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    if (token) {
      axios
        .get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUser(res.data.user);
          fetchDashboardData(token);
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token]);

  const fetchDashboardData = async (authToken) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [sumRes, currMonthRes, histRes] = await Promise.all([
        axios.get('/api/expenses/summary', { headers }),
        axios.get('/api/expenses/current-month', { headers }),
        axios.get('/api/expenses/history/summary', { headers }),
      ]);

      setSummary(sumRes.data);
      setCurrentMonthExpenses(currMonthRes.data);
      setHistorySummary(histRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await axios.post(endpoint, {
        username: usernameInput,
        password: passwordInput,
      });

      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      fetchDashboardData(newToken);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (expenseData.id) {
        await axios.put(`/api/expenses/${expenseData.id}`, expenseData, { headers });
      } else {
        await axios.post('/api/expenses', expenseData, { headers });
      }
      fetchDashboardData(token);
      setRangeData(null);
    } catch (err) {
      console.error('Error saving expense:', err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('આ ખર્ચ કાઢી નાખવો છે? (Delete expense?)')) return;
    try {
      await axios.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData(token);
      if (rangeData) {
        setRangeData((prev) => ({
          ...prev,
          expenses: prev.expenses.filter((e) => e.id !== id),
          total: prev.expenses.filter((e) => e.id !== id).reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
        }));
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleFetchRange = async (startDate, endDate) => {
    try {
      const res = await axios.get(
        `/api/expenses/range?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRangeData(res.data);
    } catch (err) {
      console.error('Error fetching range:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-blue-700">KharchBook</h1>
            <p className="text-sm text-slate-500">મોબાઈલ ખર્ચ મેનેજર (Mobile Expense Tracker)</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[48px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm min-h-[48px]"
            >
              {isRegistering ? 'રજીસ્ટર કરો (Register)' : 'લોગીન કરો (Login)'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              {isRegistering
                ? 'પહેલેથી એકાઉન્ટ છે? લોગીન કરો (Already have an account?)'
                : 'નવું એકાઉન્ટ બનાવો (Create new account)'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar username={user.username} onLogout={handleLogout} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* 1. Summary Cards (Today, Month, Year) + Add Button */}
        <SummaryCards
          todayTotal={summary.todayTotal}
          monthTotal={summary.monthTotal}
          yearTotal={summary.yearTotal}
          onOpenAddModal={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
        />

        {/* 2. Current Month Expenses (Grouped by Date) */}
        <CurrentMonthExpenses
          currentMonthExpenses={currentMonthExpenses}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteExpense}
        />

        {/* 3. Monthly History (Previous Months) */}
        <MonthlyHistory
          historySummary={historySummary}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteExpense}
        />

        {/* 4. Date Range Query */}
        <DateRangeFilter
          onFetchRange={handleFetchRange}
          rangeData={rangeData}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteExpense}
        />
      </main>

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        token={token}
      />
    </div>
  );
}