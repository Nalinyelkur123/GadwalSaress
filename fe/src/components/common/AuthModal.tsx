import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield, Sparkles, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, quickSwitchRole } = useAuth();
  
  // Views: 'signin' | 'register' | 'forgot' | 'reset'
  const [view, setView] = useState<'signin' | 'register' | 'forgot' | 'reset'>('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (view === 'signin') {
        await login(email, password);
      } else if (view === 'register') {
        await register({
          email,
          password,
          full_name: fullName,
          role: 'customer',
        });
      } else if (view === 'forgot') {
        const res = await api.post('/auth/forgot-password', { email });
        setSuccessMsg(res.data.message);
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
          setView('reset');
        }
      } else if (view === 'reset') {
        const res = await api.post('/auth/reset-password', { resetToken, newPassword });
        setSuccessMsg(res.data.message);
        setTimeout(() => setView('signin'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-warm-lg max-w-md w-full p-7 border border-ivory-300">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={() => { setIsAuthModalOpen(false); setView('signin'); setError(null); }}
          className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-800 p-1"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto mb-3">
            {view === 'forgot' || view === 'reset' ? <KeyRound size={22} /> : <User size={22} />}
          </div>
          <h2 className="font-serif font-bold text-xl text-charcoal-900">
            {view === 'signin' && 'Sign In to Your Account'}
            {view === 'register' && 'Join Gadwal Weaves'}
            {view === 'forgot' && 'Reset Your Password'}
            {view === 'reset' && 'Create New Password'}
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            {view === 'signin' && 'Access your orders, saved addresses, and authentic handlooms.'}
            {view === 'register' && 'Create an account for personalized handloom shopping.'}
            {view === 'forgot' && 'Enter your registered email to receive reset instructions.'}
            {view === 'reset' && 'Choose a secure password with at least 6 characters.'}
          </p>
        </div>

        {/* QUICK 1-CLICK DEMO ACCESS BUTTONS (On Sign In) */}
        {view === 'signin' && (
          <div className="mb-5 p-3 rounded-lg bg-ivory-100 border border-ivory-300">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-800 uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-gold-600" />
              <span>Instant Demo Access (1-Click)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickSwitchRole('customer')}
                className="py-1.5 px-2 bg-white border border-ivory-400 rounded text-[11px] font-semibold text-charcoal-800 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => quickSwitchRole('seller')}
                className="py-1.5 px-2 bg-white border border-ivory-400 rounded text-[11px] font-semibold text-charcoal-800 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                Seller
              </button>
              <button
                type="button"
                onClick={() => quickSwitchRole('admin')}
                className="py-1.5 px-2 bg-white border border-ivory-400 rounded text-[11px] font-semibold text-charcoal-800 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK MESSAGES */}
        {error && (
          <div className="p-2.5 mb-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 mb-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {view === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>
          )}

          {(view === 'signin' || view === 'register' || view === 'forgot') && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@gadwalweaves.in"
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>
          )}

          {(view === 'signin' || view === 'register') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-charcoal-700">Password</label>
                {view === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[11px] text-brand-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>
          )}

          {view === 'reset' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">New Password (min. 6 characters)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs rounded transition-colors shadow-sm mt-2"
          >
            {loading ? 'Please wait...' : (
              view === 'signin' ? 'Sign In' :
              view === 'register' ? 'Create Account' :
              view === 'forgot' ? 'Send Reset Link' : 'Set New Password'
            )}
          </button>
        </form>

        {/* BOTTOM TOGGLES */}
        <div className="mt-4 pt-3 border-t border-ivory-300 text-center text-xs text-charcoal-600">
          {view === 'signin' && (
            <div className="space-y-1">
              <p>Don't have an account? <button onClick={() => setView('register')} className="text-brand-700 font-semibold hover:underline">Create One</button></p>
              <p className="text-[11px] text-charcoal-500">
                Are you an artisan weaver? <a href="/seller/register" onClick={() => setIsAuthModalOpen(false)} className="text-gold-600 font-bold hover:underline">Register as Seller →</a>
              </p>
            </div>
          )}

          {view === 'register' && (
            <p>Already have an account? <button onClick={() => setView('signin')} className="text-brand-700 font-semibold hover:underline">Sign In</button></p>
          )}

          {(view === 'forgot' || view === 'reset') && (
            <button
              onClick={() => setView('signin')}
              className="text-xs text-brand-700 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft size={13} />
              <span>Back to Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
