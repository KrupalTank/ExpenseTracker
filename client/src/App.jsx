import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Sparkles } from 'lucide-react';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import CurrentMonthExpenses from './components/CurrentMonthExpenses';
import MonthlyHistory from './components/MonthlyHistory';
import DateRangeFilter from './components/DateRangeFilter';
import ExpenseFormModal from './components/ExpenseFormModal';
import CategoryChart from './components/CategoryChart';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);

  // Login Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // Loading & Cold-Start States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slowServerNotice, setSlowServerNotice] = useState(false);

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
    if (isSubmitting) return;

    setAuthError('');
    setIsSubmitting(true);
    setSlowServerNotice(false);

    // If request takes longer than 3 seconds (Render cold start), show status notice
    const slowTimer = setTimeout(() => {
      setSlowServerNotice(true);
    }, 3000);

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
      await fetchDashboardData(newToken);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSlowServerNotice(false);
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
                disabled={isSubmitting}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[48px] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                disabled={isSubmitting}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[48px] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {slowServerNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  સર્વર ચાલુ થઈ રહ્યું છે, કૃપા કરીને થોડી સેકન્ડ રાહ જુઓ... <br />
                  (Free server is waking up, please wait a moment...)
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {isRegistering ? 'રજીસ્ટ્રેશન થઈ રહ્યું છે...' : 'લોગીન થઈ રહ્યું છે...'}
                  </span>
                </>
              ) : (
                <span>
                  {isRegistering ? 'રજીસ્ટર કરો (Register)' : 'લોગીન કરો (Login)'}
                </span>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              disabled={isSubmitting}
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-semibold text-blue-600 hover:underline disabled:text-slate-400"
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
      <Navbar username={user.username} onLogout={handleLogout} token={token} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        <SummaryCards
          todayTotal={summary.todayTotal}
          monthTotal={summary.monthTotal}
          yearTotal={summary.yearTotal}
          onOpenAddModal={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
        />

        <CurrentMonthExpenses
          currentMonthExpenses={currentMonthExpenses}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteExpense}
        />

        <CategoryChart token={token} />

        <MonthlyHistory
          historySummary={historySummary}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteExpense}
        />

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