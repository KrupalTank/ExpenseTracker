import React from 'react';
import { Wallet, LogOut } from 'lucide-react';

export default function Navbar({ username, onLogout }) {
  return (
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
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-blue-100 hidden sm:inline">
              {username}
            </span>
            <button
              onClick={onLogout}
              className="p-2 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 rounded-lg transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-blue-200" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}