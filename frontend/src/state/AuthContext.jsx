import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from 'react';

import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('user')
      );
    } catch {
      return null;
    }
  });

  function saveAuth(data) {

    localStorage.setItem(
      'token',
      data.token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(data)
    );

    setUser(data);
  }

  async function login(
    identifier,
    password
  ) {

    const data = await api(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          password
        })
      }
    );

    saveAuth(data);

    return data;
  }

  async function register(
    name,
    username,
    email,
    password
  ) {

    const data = await api(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          username,
          email,
          password
        })
      }
    );

    saveAuth(data);

    return data;
  }

  function logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}