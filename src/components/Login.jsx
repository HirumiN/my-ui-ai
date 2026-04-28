import { useState } from 'react';
import authService from '../services/authService';
import { Sparkles, Eye, EyeOff, Loader2, Mail, Lock, User, AtSign } from 'lucide-react';

const Field = ({ icon: Icon, type = 'text', placeholder, value, onChange, rightSlot }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
      <Icon size={15} />
    </span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
    />
    {rightSlot && (
      <span className="absolute inset-y-0 right-3 flex items-center">{rightSlot}</span>
    )}
  </div>
);

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authService.login(loginEmail, loginPass);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.detail || 'Email atau password salah.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regPass.length < 6) { setError('Password minimal 6 karakter.'); return; }
    setLoading(true);
    try {
      await authService.register({ nama: regNama, email: regEmail, password: regPass });
      onLogin();
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mendaftar. Coba lagi.');
    } finally { setLoading(false); }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} className="text-slate-400 hover:text-slate-600 transition-colors">
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-50 px-4">
      <div className="relative z-10 w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100 mb-3 text-white">
            <Sparkles size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight text-center">Campus AI</h1>
          <p className="text-slate-400 text-xs mt-0.5 text-center">Platform Akademik & Karir Cerdas</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-7">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1">
            {[['login', 'Masuk'], ['register', 'Daftar']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setTab(key); setError(''); setShowPass(false); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === key
                  ? 'bg-white text-emerald-600 shadow-sm shadow-slate-200'
                  : 'text-slate-400 hover:text-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3.5 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <Field icon={Mail} type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              <Field
                icon={Lock}
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                rightSlot={eyeBtn(showPass, () => setShowPass(v => !v))}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Memuat...</> : 'Masuk'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <Field icon={User} placeholder="Nama Lengkap" value={regNama} onChange={e => setRegNama(e.target.value)} />
              <Field icon={Mail} type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              <Field
                icon={Lock}
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min. 6 karakter)"
                value={regPass}
                onChange={e => setRegPass(e.target.value)}
                rightSlot={eyeBtn(showPass, () => setShowPass(v => !v))}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Mendaftar...</> : 'Buat Akun'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-400 text-[11px] mt-6">
          Ditenagai Gemini AI · Campus AI &copy; 2025
        </p>
      </div>
    </div>
  );
}
