import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function loadUserFromStorage() {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return {
      role: 'student',
      ...parsed,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUserFromStorage);

  const login = (nextUser) => {
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
