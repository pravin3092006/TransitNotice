import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface DbUser {
  id: string | number;
  uid: string;
  email: string;
  name?: string;
  photoUrl?: string;
  persona: 'PASSENGER' | 'OPERATIONS_MONITOR';
  role?: string;
  role_title?: string;
  createdAt?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  dbUser: DbUser | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  setPersona: (persona: 'PASSENGER' | 'OPERATIONS_MONITOR') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveProfile = async () => {
    try {
      const res = await axios.get('/api/users/active/current');
      if (res.data?.user) {
        const u = res.data.user;
        const fbUser: FirebaseUser = {
          uid: u.id,
          email: u.email,
          displayName: u.name,
          photoURL: null,
        };
        setFirebaseUser(fbUser);
        setDbUser({
          id: u.id,
          uid: u.id,
          email: u.email,
          name: u.name,
          persona: u.persona,
          role_title: u.role_title,
          role: u.persona === 'OPERATIONS_MONITOR' ? 'Operations Monitor' : 'Commuter',
        });
        setToken(u.id);
      } else {
        // Fallback default commuter
        const defaultUser: FirebaseUser = {
          uid: 'USR-001',
          email: 'maya.chennai@example.com',
          displayName: 'Maya Lin',
          photoURL: null,
        };
        setFirebaseUser(defaultUser);
        setDbUser({
          id: 'USR-001',
          uid: 'USR-001',
          email: 'maya.chennai@example.com',
          name: 'Maya Lin',
          persona: 'PASSENGER',
          role: 'Commuter',
        });
        setToken('USR-001');
      }
    } catch {
      const fallback: FirebaseUser = {
        uid: 'USR-001',
        email: 'maya.chennai@example.com',
        displayName: 'Maya Lin',
        photoURL: null,
      };
      setFirebaseUser(fallback);
      setDbUser({
        id: 'USR-001',
        uid: 'USR-001',
        email: 'maya.chennai@example.com',
        name: 'Maya Lin',
        persona: 'PASSENGER',
        role: 'Commuter',
      });
      setToken('USR-001');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProfile();
  }, []);

  const loginWithGoogle = async () => {
    // Quick login with demo officer or commuter
    await fetchActiveProfile();
  };

  const signupWithEmail = async (email: string, _pass: string, name: string) => {
    try {
      const res = await axios.post('/api/users', {
        name,
        email,
        persona: 'PASSENGER',
        role_title: 'Chennai Commuter',
      });
      if (res.data?.user) {
        const u = res.data.user;
        setFirebaseUser({
          uid: u.id,
          email: u.email,
          displayName: u.name,
          photoURL: null,
        });
        setDbUser({
          id: u.id,
          uid: u.id,
          email: u.email,
          name: u.name,
          persona: u.persona,
          role: 'Commuter',
        });
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      throw new Error(err.response?.data?.error || 'Registration failed');
    }
  };

  const loginWithEmail = async (email: string, _pass: string) => {
    try {
      const res = await axios.get('/api/users');
      const found = res.data?.users?.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        await axios.post(`/api/users/${found.id}/activate`);
        setFirebaseUser({
          uid: found.id,
          email: found.email,
          displayName: found.name,
          photoURL: null,
        });
        setDbUser({
          id: found.id,
          uid: found.id,
          email: found.email,
          name: found.name,
          persona: found.persona,
          role: found.persona === 'OPERATIONS_MONITOR' ? 'Operations Monitor' : 'Commuter',
        });
      } else {
        await signupWithEmail(email, '', email.split('@')[0]);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'Login failed');
    }
  };

  const logout = async () => {
    setFirebaseUser(null);
    setDbUser(null);
    setToken(null);
  };

  const setPersona = async (persona: 'PASSENGER' | 'OPERATIONS_MONITOR') => {
    if (dbUser) {
      try {
        await axios.put(`/api/users/${dbUser.id}`, { persona });
        setDbUser({ ...dbUser, persona });
      } catch {
        setDbUser({ ...dbUser, persona });
      }
    }
  };

  const refreshProfile = async () => {
    await fetchActiveProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        dbUser,
        token,
        loading,
        loginWithGoogle,
        signupWithEmail,
        loginWithEmail,
        logout,
        setPersona,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
