import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../../types';

interface AdminLoginProps {
  settings: SiteSettings;
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  settings,
  onLoginSuccess,
  onBackToSite,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      username.trim() === settings.adminUsername &&
      password === settings.adminPassword
    ) {
      onLoginSuccess();
    } else {
      setError('Username atau password tidak sesuai. Silakan periksa kembali.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website</span>
          </button>
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.developerName}
              referrerPolicy="no-referrer"
              className="h-7 w-auto max-w-[130px] object-contain"
            />
          ) : (
            <span className="text-xs font-semibold text-amber-700">{settings.developerName}</span>
          )}
        </div>

        <div className="mb-6">
          <div className="w-11 h-11 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Dashboard Admin & CRM
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Masuk untuk mengelola katalog properti, prospek konsumen, dan pengaturan website.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-user" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              id="admin-user"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Masuk ke Dashboard
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Kredensial bawaan: <code className="font-mono text-slate-800">admin</code> /{' '}
            <code className="font-mono text-slate-800">admin123</code> (dapat diubah di Pengaturan).
          </span>
        </div>
      </div>
    </div>
  );
};
