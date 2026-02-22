import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ensureUser } from '../api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const stored = localStorage.getItem('splitsmart-user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setLoading(false);
        return;
      }
      const u = await ensureUser();
      setUser(u);
      localStorage.setItem('splitsmart-user', JSON.stringify(u));
    } catch (e) {
      console.error(e);
      setUser({ id: null, name: 'Guest' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
