import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from 'react';

import {
  api
} from '../api';

const C =
  createContext(null);

export function AuthProvider({
  children
}) {

  const [user, setUser] =
    useState(() => {

      try {

        return JSON.parse(
          localStorage.getItem(
            'user'
          )
        );

      } catch {

        return null;
      }
    });

  async function login(
    identifier,
    password
  ) {

    const data =
      await api(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            identifier,
            password
          })
        }
      );

    localStorage.setItem(
      'token',
      data.token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(data)
    );

    setUser(data);

    return data;
  }

  async function register(
    name,
    email,
    password
  ) {

    const data =
      await api(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

    localStorage.setItem(
      'token',
      data.token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(data)
    );

    setUser(data);

    return data;
  }

  function logout() {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'user'
    );

    setUser(null);
  }

  const value =
    useMemo(
      () => ({
        user,
        login,
        register,
        logout
      }),
      [user]
    );

  return (
    <C.Provider value={value}>
      {children}
    </C.Provider>
  );
}

export const useAuth =
  () => useContext(C);