import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { login, register } from '../api/services';
import {
  getApiErrorMessage,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../api/axios';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/api';

interface AuthContextValue {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  loginUser: (payload: LoginPayload) => Promise<{ success: boolean; message: string }>;
  registerUser: (payload: RegisterPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistSession(authData: AuthResponse) {
  localStorage.setItem(TOKEN_STORAGE_KEY, authData.accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData));
}

function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser) as AuthResponse);
      } catch {
        clearSession();
      }
    }

    setIsBootstrapping(false);
  }, []);

  const loginUser = async (payload: LoginPayload) => {
    try {
      const data = await login(payload);
      persistSession(data);
      setUser(data);
      return { success: true, message: 'Login successful.' };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error) };
    }
  };

  const registerUser = async (payload: RegisterPayload) => {
    try {
      const data = await register(payload);
      persistSession(data);
      setUser(data);
      return { success: true, message: 'Account created successfully.' };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error) };
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      loginUser,
      registerUser,
      logout,
    }),
    [user, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
