import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { FeedbackMessage } from '../components/FeedbackMessage';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const { isAuthenticated, loginUser, registerUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = { username, password };
    const result =
      mode === 'login' ? await loginUser(payload) : await registerUser(payload);

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message);
    }

    setIsSubmitting(false);
  }

  return (
    <div className="auth-layout">
      <section className="hero-panel">
        <p className="eyebrow">Vanty</p>
        <h1>Access courses and book practitioners in one place.</h1>
        <p className="hero-copy">
          Register or log in to explore available courses, enroll quickly, and
          schedule appointments with practitioners.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-toggle">
          <button
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setMode('register')}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="johndoe"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="secret123"
              required
            />
          </label>

          <FeedbackMessage type="error" message={errorMessage} />
          <FeedbackMessage type="success" message={successMessage} />

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Login'
                : 'Register'}
          </button>
        </form>
      </section>
    </div>
  );
}
