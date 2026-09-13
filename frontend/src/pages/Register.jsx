import React, { useState } from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';

import {
  BrainCircuit,
  UserRound,
  AtSign,
  Mail,
  LockKeyhole
} from 'lucide-react';

import { useAuth } from '../state/AuthContext';

export default function Register() {

  const navigate = useNavigate();

  const { register } = useAuth();

  const [name, setName] =
    useState('');

  const [username, setUsername] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  async function submit(e) {

    e.preventDefault();

    setError('');

    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      setError(
        'Барлық өрістерді толтырыңыз.'
      );
      return;
    }

    if (username.trim().length < 3) {
      setError(
        'Username кемінде 3 символ болуы керек.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        'Құпия сөз кемінде 6 символ болуы керек.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Құпия сөздер сәйкес емес.'
      );
      return;
    }

    setBusy(true);

    try {

      await register(
        name.trim(),
        username.trim(),
        email.trim(),
        password
      );

      navigate('/');

    } catch (err) {

      setError(
        err?.message ||
        'Тіркелу кезінде қате шықты.'
      );

    } finally {

      setBusy(false);
    }
  }

  return (
    <main style={styles.page}>

      <section style={styles.card}>

        <div style={styles.brand}>

          <div style={styles.logo}>
            <BrainCircuit size={27}/>
          </div>

          <strong>
            Adaptive AI
          </strong>

        </div>

        <h1 style={styles.title}>
          Аккаунт ашу
        </h1>

        <p style={styles.subtitle}>
          Adaptive Learning Platform жүйесіне
          студент ретінде тіркеліңіз.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          style={styles.form}
        >

          <Field
            label="Аты-жөні"
            icon={<UserRound size={18}/>}
          >

            <input
              style={styles.input}
              value={name}
              onChange={
                e => setName(e.target.value)
              }
              placeholder="Мақсат Айдаров"
              autoComplete="name"
            />

          </Field>

          <Field
            label="Login / username"
            icon={<AtSign size={18}/>}
          >

            <input
              style={styles.input}
              value={username}
              onChange={
                e => setUsername(
                  e.target.value
                )
              }
              placeholder="maksat"
              autoComplete="username"
            />

          </Field>

          <small style={styles.hint}>
            Осы login арқылы да жүйеге кіре аласыз.
            Мысалы: maksat, nurzhan01, student_25.
          </small>

          <Field
            label="Email"
            icon={<Mail size={18}/>}
          >

            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={
                e => setEmail(e.target.value)
              }
              placeholder="maksat@gmail.com"
              autoComplete="email"
            />

          </Field>

          <Field
            label="Құпия сөз"
            icon={<LockKeyhole size={18}/>}
          >

            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={
                e => setPassword(
                  e.target.value
                )
              }
              placeholder="Кемінде 6 символ"
              autoComplete="new-password"
            />

          </Field>

          <Field
            label="Құпия сөзді қайталау"
            icon={<LockKeyhole size={18}/>}
          >

            <input
              style={styles.input}
              type="password"
              value={confirmPassword}
              onChange={
                e => setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Құпия сөзді қайталаңыз"
              autoComplete="new-password"
            />

          </Field>

          <button
            type="submit"
            disabled={busy}
            style={{
              ...styles.button,
              opacity: busy ? 0.7 : 1
            }}
          >
            {busy
              ? 'Тіркелуде...'
              : 'Тіркелу'}
          </button>

        </form>

        <p style={styles.loginText}>
          Аккаунтыңыз бар ма?{' '}
          <Link
            to="/login"
            style={styles.link}
          >
            Кіру
          </Link>
        </p>

      </section>

    </main>
  );
}

function Field({
  label,
  icon,
  children
}) {

  return (
    <label style={styles.field}>

      <span style={styles.label}>
        {icon}
        {label}
      </span>

      {children}

    </label>
  );
}

const styles = {

  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '36px 18px',
    background:
      'linear-gradient(135deg, #f4f8ff 0%, #edf4ff 50%, #f8faff 100%)',
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },

  card: {
    width: 'min(470px, 94vw)',
    background: '#ffffff',
    border: '1px solid #dfe7f3',
    borderRadius: '22px',
    padding: '34px',
    boxShadow:
      '0 24px 70px rgba(31, 71, 136, 0.10)'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#2377eb',
    fontSize: '18px',
    marginBottom: '22px'
  },

  logo: {
    width: '38px',
    height: '38px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '12px',
    background: '#edf5ff'
  },

  title: {
    margin: '0 0 9px',
    color: '#10294d',
    fontSize: '32px',
    lineHeight: 1.15
  },

  subtitle: {
    color: '#56708f',
    margin: '0 0 24px',
    lineHeight: 1.6
  },

  form: {
    display: 'grid',
    gap: '15px'
  },

  field: {
    display: 'grid',
    gap: '7px'
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#173359',
    fontWeight: 700,
    fontSize: '13px'
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    height: '46px',
    borderRadius: '11px',
    border: '1px solid #ccdaeb',
    padding: '0 13px',
    outline: 'none',
    color: '#10294d',
    background: '#fff',
    fontSize: '14px'
  },

  hint: {
    marginTop: '-8px',
    color: '#7b8ea8',
    lineHeight: 1.45
  },

  error: {
    marginBottom: '18px',
    padding: '13px 15px',
    borderRadius: '11px',
    color: '#b42318',
    background: '#fff0ef',
    border: '1px solid #ffd1cd',
    fontSize: '13px',
    lineHeight: 1.5
  },

  button: {
    height: '48px',
    marginTop: '5px',
    border: 0,
    borderRadius: '11px',
    background: '#287bea',
    color: '#fff',
    fontWeight: 800,
    fontSize: '15px',
    cursor: 'pointer'
  },

  loginText: {
    margin: '22px 0 0',
    textAlign: 'center',
    color: '#425d7d'
  },

  link: {
    color: '#1f73e5',
    fontWeight: 800,
    textDecoration: 'none'
  }
};