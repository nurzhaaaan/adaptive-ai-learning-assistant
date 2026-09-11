import React, { useState } from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';
import {
  BrainCircuit
} from 'lucide-react';
import {
  useAuth
} from '../state/AuthContext';

export default function Login() {

  const [identifier, setIdentifier] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  const navigate = useNavigate();

  const {
    login
  } = useAuth();

  async function submit(e) {

    e.preventDefault();

    if (busy) {
      return;
    }

    try {

      setBusy(true);
      setError('');

      const loggedUser =
        await login(
          identifier,
          password
        );

      if (
        loggedUser?.role === 'ADMIN'
      ) {
        navigate(
          '/admin',
          {
            replace: true
          }
        );
      } else {
        navigate(
          '/',
          {
            replace: true
          }
        );
      }

    } catch (err) {

      setError(
        err?.message ||
        'Login немесе пароль қате.'
      );

    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">

      <form
        className="auth-card"
        onSubmit={submit}
      >

        <div className="auth-logo">
          <BrainCircuit />
          <span>Adaptive AI</span>
        </div>

        <h1>
          Қош келдіңіз
        </h1>

        <p>
          Adaptive Learning Platform жүйесіне кіріңіз.
        </p>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <label>
          Email немесе username

          <input
            value={identifier}
            onChange={
              e =>
                setIdentifier(
                  e.target.value
                )
            }
            type="text"
            autoComplete="username"
            placeholder="Email немесе username"
            required
          />
        </label>

        <label>
          Құпия сөз

          <input
            value={password}
            onChange={
              e =>
                setPassword(
                  e.target.value
                )
            }
            type="password"
            autoComplete="current-password"
            placeholder="Құпия сөз"
            required
          />
        </label>

        <button
          className="primary"
          disabled={busy}
        >
          {
            busy
              ? 'Кіру...'
              : 'Кіру'
          }
        </button>

        <p className="center">
          Аккаунтыңыз жоқ па?{' '}
          <Link to="/register">
            Тіркелу
          </Link>
        </p>

      </form>

    </div>
  );
}