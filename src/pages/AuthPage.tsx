import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/AuthPage.css';

type AuthView = 'login' | 'signup' | 'forgot' | 'otp';

const AuthPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const resetFields = () => {
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setMessage(null);
  };

  const switchView = (newView: AuthView) => {
    resetFields();
    setView(newView);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
  };

  // ── Email + Password Login ──
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showMessage(error.message, 'error');
    } else {
      navigate('/auth/success');
    }
    setLoading(false);
  };

  // ── Email + Password Signup ──
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters.', 'error');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      showMessage(error.message, 'error');
    } else {
      navigate('/auth/success');
    }
    setLoading(false);
  };

  // ── Google OAuth ──
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      showMessage(error.message, 'error');
      setLoading(false);
    }
  };

  // ── OTP / Magic Link ──
  const handleOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      showMessage(error.message, 'error');
    } else {
      showMessage('Magic link sent! Check your inbox.', 'success');
    }
    setLoading(false);
  };

  // ── Forgot Password ──
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      showMessage(error.message, 'error');
    } else {
      showMessage('Password reset link sent! Check your inbox.', 'success');
    }
    setLoading(false);
  };

  // ── Heading & Subtext ──
  const headings: Record<AuthView, { title: string; sub: string }> = {
    login: { title: 'Welcome Back', sub: 'Sign in to your Nomikos account' },
    signup: { title: 'Create Account', sub: 'Join Nomikos and file right, first time' },
    forgot: { title: 'Reset Password', sub: "We'll send you a reset link" },
    otp: { title: 'Magic Link', sub: "We'll email you a passwordless login link" },
  };

  return (
    <div className="auth">
      {/* Left decorative panel */}
      <div className="auth__side">
        <div className="auth__side-content">
          <a href="/" className="auth__brand">
            Nomikos<span className="auth__brand-dot">.</span>
          </a>
          <blockquote className="auth__quote">
            "Precision in filing.
            <br />
            Confidence in compliance."
          </blockquote>
          <div className="auth__side-stats">
            <div className="auth__stat">
              <span className="auth__stat-num">98%</span>
              <span className="auth__stat-label">First-pass accuracy</span>
            </div>
            <div className="auth__stat">
              <span className="auth__stat-num">3x</span>
              <span className="auth__stat-label">Faster filing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth__main">
        <div className="auth__card">
          <div className="auth__header">
            <h1 className="auth__title">{headings[view].title}</h1>
            <p className="auth__subtitle">{headings[view].sub}</p>
          </div>

          {/* Message banner */}
          {message && (
            <div className={`auth__message auth__message--${message.type}`}>{message.text}</div>
          )}

          {/* ─── LOGIN FORM ─── */}
          {view === 'login' && (
            <>
              <form className="auth__form" onSubmit={handleLogin}>
                <div className="auth__field">
                  <label className="auth__label">Email</label>
                  <input
                    className="auth__input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="auth__field">
                  <label className="auth__label">Password</label>
                  <input
                    className="auth__input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="auth__row">
                  <label className="auth__checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="auth__checkmark" />
                    Remember me
                  </label>
                  <button type="button" className="auth__link" onClick={() => switchView('forgot')}>
                    Forgot password?
                  </button>
                </div>
                <button className="auth__btn auth__btn--primary" type="submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="auth__divider">
                <span>or</span>
              </div>

              <div className="auth__socials">
                <button
                  className="auth__btn auth__btn--google"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="auth__google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
                <button
                  className="auth__btn auth__btn--outline"
                  onClick={() => switchView('otp')}
                  disabled={loading}
                >
                  Sign in with Magic Link
                </button>
              </div>

              <p className="auth__footer-text">
                Don't have an account?{' '}
                <button className="auth__link" onClick={() => switchView('signup')}>
                  Sign Up
                </button>
              </p>
            </>
          )}

          {/* ─── SIGNUP FORM ─── */}
          {view === 'signup' && (
            <>
              <form className="auth__form" onSubmit={handleSignup}>
                <div className="auth__field">
                  <label className="auth__label">Full Name</label>
                  <input
                    className="auth__input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="auth__field">
                  <label className="auth__label">Email</label>
                  <input
                    className="auth__input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="auth__field">
                  <label className="auth__label">Password</label>
                  <input
                    className="auth__input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                <div className="auth__field">
                  <label className="auth__label">Confirm Password</label>
                  <input
                    className="auth__input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button className="auth__btn auth__btn--primary" type="submit" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <div className="auth__divider">
                <span>or</span>
              </div>

              <div className="auth__socials">
                <button
                  className="auth__btn auth__btn--google"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="auth__google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <p className="auth__footer-text">
                Already have an account?{' '}
                <button className="auth__link" onClick={() => switchView('login')}>
                  Sign In
                </button>
              </p>
            </>
          )}

          {/* ─── FORGOT PASSWORD ─── */}
          {view === 'forgot' && (
            <>
              <form className="auth__form" onSubmit={handleForgotPassword}>
                <div className="auth__field">
                  <label className="auth__label">Email</label>
                  <input
                    className="auth__input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button className="auth__btn auth__btn--primary" type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <p className="auth__footer-text">
                <button className="auth__link" onClick={() => switchView('login')}>
                  ← Back to Sign In
                </button>
              </p>
            </>
          )}

          {/* ─── OTP / MAGIC LINK ─── */}
          {view === 'otp' && (
            <>
              <form className="auth__form" onSubmit={handleOtp}>
                <div className="auth__field">
                  <label className="auth__label">Email</label>
                  <input
                    className="auth__input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button className="auth__btn auth__btn--primary" type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Magic Link'}
                </button>
              </form>
              <p className="auth__footer-text">
                <button className="auth__link" onClick={() => switchView('login')}>
                  ← Back to Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
