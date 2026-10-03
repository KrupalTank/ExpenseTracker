import React, { useState } from 'react';
import { Wallet, LogOut, Database, X, HardDrive } from 'lucide-react';
import axios from 'axios';

export default function Navbar({ username, onLogout, token }) {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const fetchDbStats = async () => {
    setIsDbModalOpen(true);
    setLoadingDb(true);
    try {
      const res = await axios.get('/api/expenses/db-storage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDbStats(res.data);
    } catch (err) {
      console.error('Failed to load DB stats:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-blue-700 text-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">KharchBook</h1>
              <p className="text-xs text-blue-200">ખર્ચ મેનેજર</p>
            </div>
          </div>

          {username && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-100 hidden sm:inline mr-1">
                {username}
              </span>

              {/* Database Storage Icon Button */}
              <button
                onClick={fetchDbStats}
                className="p-2 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 rounded-lg transition-colors flex items-center justify-center text-blue-200 hover:text-white"
                title="Database Storage Status"
              >
                <Database className="w-5 h-5" />
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 rounded-lg transition-colors flex items-center justify-center text-blue-200 hover:text-white"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Database Storage Status Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <HardDrive className="w-4 h-4 text-blue-600" />
                <span>ડેબી સ્ટોરેજ (DB Usage)</span>
              </div>
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDb ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                સ્ટોરેજ વિગત આવી રહી છે... (Fetching database size...)
              </div>
            ) : dbStats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-500">વપરાયેલ જગ્યા (Used):</span>
                  <span className="text-slate-900 text-sm font-bold">
                    {dbStats.sizeMB} MB / {dbStats.limitMB} MB
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      dbStats.usedPercentage > 85 ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(dbStats.usedPercentage, 2)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                  <span>Neon Free Tier Cap</span>
                  <span className="text-blue-700 font-bold">{dbStats.usedPercentage}% Full</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100">
                  ⚡ ડેટાબેઝ ક્લાઉડ સુરક્ષિત રીતે Neon Cloud Server પર સંગ્રહિત છે.
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-red-500">
                માહિતી મેળવવામાં નિષ્ફળ (Failed to fetch storage info)
              </div>
            )}

            <button
              onClick={() => setIsDbModalOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              બંધ કરો (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
}