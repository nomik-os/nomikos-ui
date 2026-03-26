import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically picks up tokens from the URL hash
      // when getSession is called
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        navigate('/auth/success');
        return;
      }

      // Fallback: listen for auth state change (for OAuth flows)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
          navigate('/auth/success');
        }
      });

      // Cleanup + timeout fallback
      setTimeout(() => {
        subscription.unsubscribe();
        setError('Authentication timed out. Please try again.');
      }, 10000);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--mono)',
        fontSize: '0.8rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        color: 'var(--muted)',
        gap: '1rem',
      }}
    >
      {error ? (
        <>
          <span style={{ color: 'var(--rust)' }}>{error}</span>
          <button
            onClick={() => navigate('/auth')}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              color: 'var(--gold)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ← Back to Sign In
          </button>
        </>
      ) : (
        'Authenticating…'
      )}
    </div>
  );
};

export default AuthCallback;
