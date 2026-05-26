import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from 'lucide-react';

import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

type AuthTab = 'login' | 'signup' | 'forgot_password';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalOptions,
    signIn,
    signUp,
    isRecoveringPassword,
    setIsRecoveringPassword,
  } = useAuth();

  const [tab, setTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupOrg, setSignupOrg] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupOrg('');
    setResetEmail('');
    setNewPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    setIsRecoveringPassword(false);
    closeAuthModal();
  };

  // Preselect the requested tab + apply required-mode lock whenever the modal
  // re-opens. We watch isAuthModalOpen so reopening with different options
  // takes effect.
  useEffect(() => {
    if (!isAuthModalOpen) return;
    if (authModalOptions.mode === 'signup') setTab('signup');
    else if (authModalOptions.mode === 'signin') setTab('login');
  }, [isAuthModalOpen, authModalOptions.mode]);

  const required = !!authModalOptions.required;

  // Lock body scroll, trap ESC (unless required), autofocus first field.
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !required) handleClose();
      if (e.key === 'Tab' && modalRef.current) {
        trapFocus(e, modalRef.current);
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => firstFieldRef.current?.focus(), 80);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthModalOpen, tab, isRecoveringPassword, required]);

  // ─── Submit handlers ───

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(loginEmail, loginPassword);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    if (!signupName.trim()) {
      setError('Please add your name.');
      setLoading(false);
      return;
    }
    // Empty org name → auto-fall-back to "{Name}'s Account". The signup form
    // already shows an inline note explaining this so it's not a surprise.
    const resolvedOrg = signupOrg.trim() || `${signupName.trim()}'s Account`;
    const result = await signUp(
      signupEmail,
      signupPassword,
      signupName,
      resolvedOrg,
    );
    if (result.error) setError(result.error);
    else if (result.needsConfirmation) {
      setSuccess('Check your email to confirm your account, then log in.');
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    });
    if (error) setError(error.message);
    else setSuccess("Check your email for the reset link.");
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else {
      setSuccess('Password updated. You can now log in.');
      setIsRecoveringPassword(false);
    }
    setLoading(false);
  };

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    setError('');
    setSuccess('');
  };

  if (!isAuthModalOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={required ? undefined : handleClose}
          className="absolute inset-0 bg-lsl-ink/55 backdrop-blur-sm"
          aria-hidden="true"
        />

        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-lsl-stone bg-lsl-cream shadow-lsl-lift"
        >
          {!required && (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-lsl-graphite shadow-lsl-card backdrop-blur-sm transition-colors hover:bg-white hover:text-lsl-ink"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}

          <div className="px-8 pt-8">
            <div className="flex items-center gap-3">
              <img
                src="/LSL_Logo.png"
                alt=""
                className="h-9 w-auto brightness-0"
              />
              <span
                id="auth-modal-title"
                className="font-display text-xl font-semibold tracking-tight text-lsl-ink"
              >
                {isRecoveringPassword
                  ? 'Set a new password'
                  : tab === 'forgot_password'
                    ? 'Reset password'
                    : tab === 'login'
                      ? 'Welcome back'
                      : 'Create your workspace'}
              </span>
            </div>

            {authModalOptions.message && !isRecoveringPassword && (
              <p className="mt-3 text-sm leading-relaxed text-lsl-graphite">
                {authModalOptions.message}
              </p>
            )}

            {!isRecoveringPassword && tab !== 'forgot_password' && (
              <div className="mt-6 inline-flex rounded-full border border-lsl-stone bg-white p-1">
                <TabButton
                  active={tab === 'login'}
                  onClick={() => switchTab('login')}
                >
                  Log in
                </TabButton>
                <TabButton
                  active={tab === 'signup'}
                  onClick={() => switchTab('signup')}
                >
                  Sign up
                </TabButton>
              </div>
            )}
          </div>

          <div className="px-8 pb-8 pt-6">
            {success ? (
              <SuccessView
                message={success}
                onContinue={() => {
                  setSuccess('');
                  switchTab('login');
                }}
              />
            ) : isRecoveringPassword ? (
              <PasswordUpdateForm
                value={newPassword}
                onChange={setNewPassword}
                showPassword={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                error={error}
                loading={loading}
                onSubmit={handleUpdatePassword}
                firstRef={firstFieldRef}
              />
            ) : tab === 'forgot_password' ? (
              <ForgotForm
                email={resetEmail}
                onEmailChange={setResetEmail}
                error={error}
                loading={loading}
                onSubmit={handleForgot}
                onBack={() => switchTab('login')}
                firstRef={firstFieldRef}
              />
            ) : tab === 'login' ? (
              <LoginForm
                email={loginEmail}
                password={loginPassword}
                showPassword={showPassword}
                onEmail={setLoginEmail}
                onPassword={setLoginPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                error={error}
                loading={loading}
                onSubmit={handleLogin}
                onForgot={() => switchTab('forgot_password')}
                onSwitch={() => switchTab('signup')}
                firstRef={firstFieldRef}
              />
            ) : (
              <SignupForm
                name={signupName}
                org={signupOrg}
                email={signupEmail}
                password={signupPassword}
                showPassword={showPassword}
                onName={setSignupName}
                onOrg={setSignupOrg}
                onEmail={setSignupEmail}
                onPassword={setSignupPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                error={error}
                loading={loading}
                onSubmit={handleSignup}
                onSwitch={() => switchTab('login')}
                firstRef={firstFieldRef}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

// ─── Sub-components ───

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors',
        active
          ? 'bg-lsl-ink text-lsl-cream'
          : 'text-lsl-graphite hover:text-lsl-ink',
      )}
    >
      {children}
    </button>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
    >
      {message}
    </p>
  );
}

function FieldWrap({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-lsl-graphite">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-lsl-graphite/70">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  'h-11 w-full rounded-xl border border-lsl-stone bg-white pl-10 pr-4 text-sm text-lsl-ink placeholder:text-lsl-graphite/70 transition-colors focus:border-lsl-navy focus:outline-none focus:ring-2 focus:ring-lsl-navy/30';

const inputClsWithToggle = `${inputCls} pr-10`;

function LoginForm(props: {
  email: string;
  password: string;
  showPassword: boolean;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onToggleShow: () => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgot: () => void;
  onSwitch: () => void;
  firstRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <FieldWrap label="Email">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            ref={props.firstRef}
            type="email"
            autoComplete="email"
            required
            value={props.email}
            onChange={(e) => props.onEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputCls}
          />
        </div>
      </FieldWrap>

      <FieldWrap label="Password">
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            type={props.showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={props.password}
            onChange={(e) => props.onPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClsWithToggle}
          />
          <button
            type="button"
            onClick={props.onToggleShow}
            aria-label={props.showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lsl-graphite hover:text-lsl-ink"
          >
            {props.showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={props.onForgot}
            className="text-[11px] font-medium text-lsl-navy underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </FieldWrap>

      {props.error && <FormError message={props.error} />}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={props.loading}
        className="w-full"
      >
        {props.loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> Signing in…
          </>
        ) : (
          'Log in'
        )}
      </Button>

      <p className="text-center text-xs text-lsl-graphite">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={props.onSwitch}
          className="font-medium text-lsl-navy underline-offset-4 hover:underline"
        >
          Create one
        </button>
      </p>
    </form>
  );
}

function SignupForm(props: {
  name: string;
  org: string;
  email: string;
  password: string;
  showPassword: boolean;
  onName: (v: string) => void;
  onOrg: (v: string) => void;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onToggleShow: () => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitch: () => void;
  firstRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <FieldWrap label="Full name">
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            ref={props.firstRef}
            type="text"
            autoComplete="name"
            required
            value={props.name}
            onChange={(e) => props.onName(e.target.value)}
            placeholder="Jane Smith"
            className={inputCls}
          />
        </div>
      </FieldWrap>

      <FieldWrap label="Organization" hint="Workspace name">
        <div className="relative">
          <Building2
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            type="text"
            autoComplete="organization"
            value={props.org}
            onChange={(e) => props.onOrg(e.target.value)}
            placeholder="e.g. Riverside Soccer Club"
            className={inputCls}
          />
        </div>
        {props.org.trim() ? (
          <p className="mt-1 pl-1 text-[11px] text-lsl-graphite">
            We&apos;ll create a portal for your team. Members join later with an access code.
          </p>
        ) : (
          <p className="mt-1 pl-1 text-[11px] text-lsl-graphite">
            We&apos;ll set up your account as{' '}
            <span className="font-semibold text-lsl-ink">
              {(props.name.trim() || 'Your Name')}&apos;s Account
            </span>
            {' '}— you can rename it later.
          </p>
        )}
      </FieldWrap>

      <FieldWrap label="Email">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            type="email"
            autoComplete="email"
            required
            value={props.email}
            onChange={(e) => props.onEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputCls}
          />
        </div>
      </FieldWrap>

      <FieldWrap label="Password" hint="Min 6 characters">
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            type={props.showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={6}
            value={props.password}
            onChange={(e) => props.onPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClsWithToggle}
          />
          <button
            type="button"
            onClick={props.onToggleShow}
            aria-label={props.showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lsl-graphite hover:text-lsl-ink"
          >
            {props.showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </FieldWrap>

      {props.error && <FormError message={props.error} />}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={props.loading}
        className="w-full"
      >
        {props.loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-xs text-lsl-graphite">
        Already have an account?{' '}
        <button
          type="button"
          onClick={props.onSwitch}
          className="font-medium text-lsl-navy underline-offset-4 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

function ForgotForm(props: {
  email: string;
  onEmailChange: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  firstRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <p className="text-sm text-lsl-graphite">
        Enter your email and we&apos;ll send a reset link.
      </p>
      <FieldWrap label="Email">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            ref={props.firstRef}
            type="email"
            autoComplete="email"
            required
            value={props.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            placeholder="you@company.com"
            className={inputCls}
          />
        </div>
      </FieldWrap>

      {props.error && <FormError message={props.error} />}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={props.loading}
        className="w-full"
      >
        {props.loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> Sending…
          </>
        ) : (
          'Send reset link'
        )}
      </Button>

      <p className="text-center text-xs text-lsl-graphite">
        Remembered it?{' '}
        <button
          type="button"
          onClick={props.onBack}
          className="font-medium text-lsl-navy underline-offset-4 hover:underline"
        >
          Back to login
        </button>
      </p>
    </form>
  );
}

function PasswordUpdateForm(props: {
  value: string;
  onChange: (v: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  firstRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <p className="text-sm text-lsl-graphite">
        Enter a new password for your account.
      </p>
      <FieldWrap label="New password" hint="Min 6 characters">
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsl-graphite"
            strokeWidth={1.75}
          />
          <input
            ref={props.firstRef}
            type={props.showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={6}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder="••••••••"
            className={inputClsWithToggle}
          />
          <button
            type="button"
            onClick={props.onToggleShow}
            aria-label={props.showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lsl-graphite hover:text-lsl-ink"
          >
            {props.showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </FieldWrap>

      {props.error && <FormError message={props.error} />}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={props.loading}
        className="w-full"
      >
        {props.loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> Updating…
          </>
        ) : (
          'Update password'
        )}
      </Button>
    </form>
  );
}

function SuccessView({
  message,
  onContinue,
}: {
  message: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-6 text-center"
    >
      <CheckCircle
        className="h-12 w-12 text-lsl-navy"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-sm leading-relaxed text-lsl-graphite">{message}</p>
      <Button variant="primary" size="md" onClick={onContinue}>
        Go to login
      </Button>
    </motion.div>
  );
}

// ─── Focus trap helper ───

function trapFocus(e: KeyboardEvent, container: HTMLElement) {
  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
