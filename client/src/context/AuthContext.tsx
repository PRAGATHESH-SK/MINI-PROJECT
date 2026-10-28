import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  registerStudent: (data: any) => Promise<User>;
  registerEmployer: (data: any) => Promise<User>;
  quickDemoLogin: (role: Role) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res: any = await api.get('/auth/me');
      const currentUser = res?.user || res?.data?.user || res?.data;
      if (res?.success && currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (_err) {
      setUser(null);
      localStorage.removeItem('connecting_tech_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    const res: any = await api.post('/auth/login', {
      email,
      password,
    });

    const token = res?.token || res?.data?.token;
    if (token) {
      localStorage.setItem('connecting_tech_token', token);
    }

    const authedUser = res?.user || res?.data?.user;
    if (!authedUser) {
      throw new Error(res?.error || 'Authentication succeeded but user record was not received.');
    }

    setUser(authedUser);
    return authedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_e) {
      // Ignore
    } finally {
      localStorage.removeItem('connecting_tech_token');
      setUser(null);
    }
  };

  const registerStudent = async (data: any): Promise<User> => {
    const res: any = await api.post('/auth/register/student', data);
    const token = res?.token || res?.data?.token;
    if (token) {
      localStorage.setItem('connecting_tech_token', token);
    }
    const authedUser = res?.user || res?.data?.user;
    if (!authedUser) {
      throw new Error(res?.error || 'Registration failed');
    }
    setUser(authedUser);
    return authedUser;
  };

  const registerEmployer = async (data: any): Promise<User> => {
    const res: any = await api.post('/auth/register/employer', data);
    const token = res?.token || res?.data?.token;
    if (token) {
      localStorage.setItem('connecting_tech_token', token);
    }
    const authedUser = res?.user || res?.data?.user;
    if (!authedUser) {
      throw new Error(res?.error || 'Registration failed');
    }
    setUser(authedUser);
    return authedUser;
  };

  const quickDemoLogin = async (role: Role): Promise<User> => {
    let email = 'admin@connectingtech.tn.gov.in';
    let password = 'Admin@123';

    if (role === 'STUDENT') {
      email = 'student.karthik@annauniv-demo.edu';
      password = 'Student@123';
    } else if (role === 'EMPLOYER') {
      email = 'tcs.careers@tcs-demo.com';
      password = 'Employer@123';
    }

    return login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        registerStudent,
        registerEmployer,
        quickDemoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
