import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { adminApi } from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // When any authenticated request gets a 401 (expired/invalid 24h admin
    // JWT), the API client invokes this to drop the stale session. Clearing
    // `user` flips isAuthenticated to false, so ProtectedRoute redirects to
    // /login instead of leaving the user "logged in" on perpetually-erroring
    // pages. (The token itself is already cleared by the client.)
    adminApi.setUnauthorizedHandler(() => {
      localStorage.removeItem('yebomart_admin_user');
      setUser(null);
    });

    // Check for existing token on mount
    const token = adminApi.getToken();
    if (token) {
      // In a real app, you'd validate the token with the server
      // For now, we'll just check if it exists
      const savedUser = localStorage.getItem('yebomart_admin_user');
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // Invalid JSON, clear it
          localStorage.removeItem('yebomart_admin_user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await adminApi.login(email, password);
    if (error) {
      return { success: false, error };
    }
    if (data?.token && data?.user) {
      adminApi.setToken(data.token);
      setUser(data.user);
      localStorage.setItem('yebomart_admin_user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, error: 'Invalid response from server' };
  };

  const logout = () => {
    adminApi.clearToken();
    localStorage.removeItem('yebomart_admin_user');
    setUser(null);
  };

  // Merge server-confirmed changes (e.g. profile edits) into the cached user
  // so the header/sidebar reflect them without a re-login.
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('yebomart_admin_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
