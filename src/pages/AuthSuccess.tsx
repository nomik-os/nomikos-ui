import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="auth">
      <div className="auth__side">
        <div className="auth__side-content">
          <a href="/" className="auth__brand">
            Nomikos<span className="auth__brand-dot">.</span>
          </a>
          <blockquote className="auth__quote">
            "Precision in filing.<br />Confidence in compliance."
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

      <div className="auth__main">
        <div className="auth__card" style={{ textAlign: 'center' }}>
          <div className="auth-success__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="var(--ink)" />
              <path
                d="M15 24.5L21 30.5L33 18.5"
                stroke="var(--gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="auth__title" style={{ marginTop: '1.5rem' }}>Sign In Completed</h1>
          <p className="auth__subtitle" style={{ marginTop: '0.5rem' }}>
            Welcome to Nomikos. Redirecting you shortly…
          </p>
          <button
            className="auth__btn auth__btn--primary"
            style={{ marginTop: '2rem' }}
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </button>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.68rem',
            letterSpacing: '0.06em',
            color: 'var(--muted)',
            marginTop: '1.25rem',
            textTransform: 'uppercase',
          }}>
            Redirecting in 3 seconds…
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthSuccess
