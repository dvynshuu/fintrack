import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { User, RegisterPayload, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    // Load the Google Identity Services client script if not already present
    if (!window.google?.accounts?.oauth2) {
      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById('google-gsi-client');
        if (existing) {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', reject);
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Identity Services library'));
        document.body.appendChild(script);
      });
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Google Client ID is not configured (VITE_GOOGLE_CLIENT_ID).');
    }

    return new Promise<User>((resolve, reject) => {
      // Initialize Google Sign-In token client
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) {
            console.error('Google OAuth error:', response.error);
            return reject(new Error(response.error_description || response.error));
          }

          try {
            // Retrieve user profile using the access token
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${response.access_token}`
              }
            });

            if (!userInfoResponse.ok) {
              throw new Error('Failed to retrieve user profile from Google');
            }

            const userData = await userInfoResponse.json();

            // Send credentials to backend authentication gateway
            const result = await api.post('/api/auth/google', {
              token: userData.sub,
              email: userData.email,
              name: userData.name,
              picture: userData.picture
            });

            const { token, user: authUser } = result.data;
            localStorage.setItem('token', token);
            setUser(authUser);
            resolve(authUser);
          } catch (error: any) {
            console.error('Error processing Google login:', error);
            if (error.response?.data?.error?.message) {
              reject(new Error(error.response.data.error.message));
            } else if (error.response?.data?.message) {
              reject(new Error(error.response.data.message));
            } else if (error.request) {
              reject(new Error('Unable to connect to BudgetRoot server. Please ensure the backend is running on port 5005.'));
            } else {
              reject(new Error(error.message || 'Failed to authenticate with Google'));
            }
          }
        },
        error_callback: (nonOAuthErr) => {
          console.error('Google token client error:', nonOAuthErr);
          reject(new Error(nonOAuthErr?.message || 'Google Sign-In popup was closed or blocked.'));
        }
      });

      // Trigger the Google Sign-In flow
      client.requestAccessToken();
    });
  };

  const register = async (userData: RegisterPayload): Promise<User> => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem('token', token);
      setUser(newUser);
      return newUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
