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

axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [token] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearUser = () => {
    setFirebaseUser(null);
    setDbUser(null);
  };

  const loadGoogleProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me', {
        withCredentials: true
      });

      const u = res.data?.user;

      if (!u) {
        clearUser();
        return;
      }

      setFirebaseUser({
        uid: u.id,
        email: u.email,
        displayName: u.name,
        photoURL: u.photoUrl || null
      });

      setDbUser({
        id: u.id,
        uid: u.id,
        email: u.email,
        name: u.name,
        photoUrl: u.photoUrl || null,
        persona: u.persona || 'PASSENGER',
        role_title: u.role_title,
        role: u.persona === 'OPERATIONS_MONITOR'
          ? 'Operations Monitor'
          : 'Commuter'
      });
    } catch {
      clearUser();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleProfile();
  }, []);

  // Start Google account chooser
  const loginWithGoogle = async () => {
    window.location.href = '/api/auth/google';
  };

  // Email login is disabled until secure password authentication is implemented.
  const signupWithEmail = async (
    _email: string,
    _pass: string,
    _name: string
  ) => {
    throw new Error('Please use Continue with Google to create your account.');
  };

  const loginWithEmail = async (
    _email: string,
    _pass: string
  ) => {
    throw new Error('Please use Continue with Google to sign in.');
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
    } finally {
      clearUser();
      window.location.href = '/';
    }
  };

  const setPersona = async (
    persona: 'PASSENGER' | 'OPERATIONS_MONITOR'
  ) => {
    await axios.put('/api/auth/persona', { persona }, {
      withCredentials: true
    });

    if (dbUser) {
      setDbUser({ ...dbUser, persona });
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await loadGoogleProfile();
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
        refreshProfile
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
