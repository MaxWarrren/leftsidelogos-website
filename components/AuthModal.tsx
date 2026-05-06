import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Building2, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

type AuthTab = 'login' | 'signup';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupOrg, setSignupOrg] = useState('');

  const resetForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupOrg('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(loginEmail, loginPassword);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!signupOrg.trim()) {
      setError('Organization name is required');
      setLoading(false);
      return;
    }

    const result = await signUp(signupEmail, signupPassword, signupName, signupOrg);
    if (result.error) {
      setError(result.error);
    } else if (result.needsConfirmation) {
      setSuccess('Check your email to confirm your account, then log in.');
    }
    setLoading(false);
  };

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    setError('');
    setSuccess('');
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/LSL_Logo.png"
                alt="Left Side Logos"
                className="h-9 w-auto"
              />
              <span className="font-display font-bold text-xl text-lsl-black tracking-tight">
                Left Side Logos
              </span>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                  tab === 'login'
                    ? 'bg-white text-lsl-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => switchTab('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                  tab === 'signup'
                    ? 'bg-white text-lsl-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-sm text-gray-600">{success}</p>
                <button
                  onClick={() => { setSuccess(''); switchTab('login'); }}
                  className="mt-4 text-sm font-semibold text-lsl-blue hover:underline"
                >
                  Go to Login
                </button>
              </motion.div>
            ) : tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lsl-blue/50 focus:border-lsl-blue transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lsl-blue/50 focus:border-lsl-blue transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 font-medium bg-red-50 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-lsl-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchTab('signup')} className="text-lsl-blue font-semibold hover:underline">
                    Create one
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3.5 mt-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lsl-blue/50 focus:border-lsl-blue transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Organization / Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={signupOrg}
                      onChange={(e) => setSignupOrg(e.target.value)}
                      placeholder="Your Company Inc."
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lsl-blue/50 focus:border-lsl-blue transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 pl-1">
                    We'll create a workspace for your team. Employees can join later with an access code.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lsl-blue/50 focus:border-lsl-blue transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-lsl-blue/50 focus:border-lsl-blue transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 font-medium bg-red-50 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-lsl-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchTab('login')} className="text-lsl-blue font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
