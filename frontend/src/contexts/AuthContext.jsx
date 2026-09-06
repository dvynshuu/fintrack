import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const loginWithGoogle = () => {
    return new Promise(async (resolve, reject) => {
      try {
        // Load the Google Identity Services client script if not already present
        if (!window.google?.accounts?.oauth2) {
          await new Promise((res, rej) => {
            const existing = document.getElementById('google-gsi-client');
            if (existing) {
              existing.addEventListener('load', () => res());
              existing.addEventListener('error', rej);
              return;
            }
            const script = document.createElement('script');
            script.id = 'google-gsi-client';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => res();
            script.onerror = () => rej(new Error('Failed to load Google Identity Services library'));
            document.body.appendChild(script);
          });
        }

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          throw new Error('Google Client ID is not configured (VITE_GOOGLE_CLIENT_ID).');
        }

        // Initialize Google Sign-In token client
        const client = window.google.accounts.oauth2.initTokenClient({
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
                  'Authorization': `Bearer ${response.access_token}`
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
            } catch (error) {
              console.error('Error processing Google login:', error);
              if (error.response?.data?.error?.message) {
                reject(new Error(error.response.data.error.message));
              } else if (error.response?.data?.message) {
                reject(new Error(error.response.data.message));
              } else if (error.request) {
                reject(new Error('Unable to connect to FinTrack server. Please ensure the backend is running on port 5005.'));
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
      } catch (error) {
        console.error('Google login initialization error:', error);
        reject(error);
      }
    });
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem('token', token);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 