'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hashPassword, verifyPassword } from '@/lib/crypto';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin' | 'lsm';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Mock users database
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer' as const,
  },
  {
    id: '2',
    name: 'Jane Provider',
    email: 'provider@test.com',
    password: 'password123',
    role: 'provider' as const,
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin' as const,
  },
  {
    id: '4',
    name: 'LSM Manager',
    email: 'lsm@test.com',
    password: 'password123',
    role: 'lsm' as const,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for existing session on mount
  useEffect(() => {
    console.log('🔍 AuthProvider: Checking for stored user...');
    const storedUser = localStorage.getItem('auth_user');
    console.log('🔍 AuthProvider: Raw localStorage value:', storedUser);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ AuthProvider: Parsed user data:', userData);
        console.log('✅ AuthProvider: user.name =', userData.name);
        console.log('✅ AuthProvider: user.firstName =', userData.firstName);
        console.log('✅ AuthProvider: user.lastName =', userData.lastName);
        setUser(userData);
      } catch (error) {
        console.error('❌ Failed to parse stored user:', error);
        localStorage.removeItem('auth_user');
      }
    } else {
      console.log('❌ AuthProvider: No stored user found');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // First check localStorage for registered users
    const storedUsers = localStorage.getItem('users');
    let foundUser = null;

    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        
        // Check for users with hashed passwords
        for (const user of users) {
          if (user.email === email) {
            if (user.passwordHash) {
              // New users with hashed passwords
              const isValid = await verifyPassword(password, user.passwordHash);
              if (isValid) {
                foundUser = user;
                console.log('✅ Found user in localStorage (hashed):', foundUser.email);
                break;
              }
            } else if (user.password === password) {
              // Old users with plain text passwords (legacy support)
              foundUser = user;
              console.log('✅ Found user in localStorage (plain):', foundUser.email);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing stored users:', error);
      }
    }

    // Fallback to mock users if not found in localStorage
    if (!foundUser) {
      foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (foundUser) {
        console.log('✅ Found user in MOCK_USERS:', foundUser.email);
      }
    }

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    // Create simplified auth object (only essential fields)
    const authUser = {
      id: foundUser.id,
      name: foundUser.name || `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim(),
      email: foundUser.email,
      role: foundUser.role
    };
    
    // Store in localStorage
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setUser(authUser);

    console.log('✅ Login successful, auth_user set:', authUser);

    // Redirect to homepage after login
    window.location.href = '/';
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
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