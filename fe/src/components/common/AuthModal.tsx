import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, quickSwitchRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          role,
        });
      } else {
        await login(email, password);
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
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-800 p-1"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto mb-3">
            <User size={22} />
          </div>
          <h2 className="font-serif font-bold text-xl text-charcoal-900">
            {isRegister ? 'Join Gadwal Weaves' : 'Sign In to Your Account'}
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Access your orders, weaver interactions, or vendor portal.
          </p>
        </div>

        {/* QUICK 1-CLICK DEMO ACCESS BUTTONS */}
        <div className="mb-5 p-3 rounded-lg bg-ivory-100 border border-ivory-300">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-800 uppercase tracking-wider mb-2">
            <Sparkles size={12} className="text-gold-600" />
            <span>Instant Demo Sign-In (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickSwitchRole('customer')}
              className="py-1.5 px-2 bg-white border border-ivory-400 rounded text-[11px] font-semibold text-charcoal-800 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-400 transition-colors"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => quickSwitchRole('seller')}
              className="py-1.5 px-2 bg-white border border-ivory-400 rounded text-[11px] font-semibold text-charcoal-800 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-400 transition-colors"
            >
              Seller
            </button>
            <button
              type="button"
              onClick={() => quickSwitchRole('admin')}
              className="py-1.5 px-2 bg-white border border-ivory-400 rounded text-[11px] font-semibold text-charcoal-800 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-400 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Radhika Rao"
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400 focus:outline-none focus:border-gold-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@example.com"
              className="w-full px-3 py-2 text-xs rounded border border-ivory-400 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded border border-ivory-400 focus:outline-none focus:border-gold-400"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400 bg-white"
              >
                <option value="customer">Shopper / Customer</option>
                <option value="seller">Artisan Weaver / Seller</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs rounded transition-colors shadow-sm mt-2"
          >
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-charcoal-600">
          {isRegister ? (
            <span>Already have an account? <button onClick={() => setIsRegister(false)} className="text-brand-700 font-semibold hover:underline">Sign In</button></span>
          ) : (
            <span>Don't have an account? <button onClick={() => setIsRegister(true)} className="text-brand-700 font-semibold hover:underline">Create One</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
