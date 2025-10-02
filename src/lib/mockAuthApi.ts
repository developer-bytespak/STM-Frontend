/**
 * Mock Authentication API
 * Replace with actual backend calls when ready
 */

import { 
  AuthResponse, 
  EmailExistsResponse, 
  SignupFormData, 
  UserRegistrationData 
} from '@/types/auth';

// Simulated database (localStorage)
const USERS_KEY = 'mock_users_db';

interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: 'pending' | 'active';
  role: 'customer';
  createdAt: string;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all mock users from localStorage
 */
const getUsers = (): MockUser[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  if (!usersStr) return [];
  
  try {
    return JSON.parse(usersStr);
  } catch {
    return [];
  }
};

/**
 * Save users to localStorage
 */
const saveUsers = (users: MockUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Check if email already exists
 */
export const checkEmailExists = async (email: string): Promise<EmailExistsResponse> => {
  await delay(500); // Simulate network delay

  const users = getUsers();
  const exists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

  return {
    exists,
    message: exists ? 'Email already registered' : 'Email available',
  };
};

/**
 * Register new user (pending status until OTP verification)
 */
export const registerUser = async (formData: SignupFormData): Promise<AuthResponse> => {
  await delay(800);

  try {
    // Check if email already exists
    const emailCheck = await checkEmailExists(formData.email);
    if (emailCheck.exists) {
      return {
        success: false,
        message: 'Email already registered',
        error: 'This email is already registered. Please login instead.',
      };
    }

    const users = getUsers();
    
    const newUser: MockUser = {
      id: `user_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password, // In real app, this would be hashed
      status: 'pending',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        userId: newUser.id,
        email: newUser.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Registration failed',
      error: 'An error occurred during registration. Please try again.',
    };
  }
};

/**
 * Verify OTP and activate user account
 */
export const verifyOTPAndActivate = async (
  email: string
): Promise<AuthResponse> => {
  await delay(600);

  try {
    const users = getUsers();
    const userIndex = users.findIndex(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
        error: 'User account not found. Please register first.',
      };
    }

    // Activate user account
    users[userIndex].status = 'active';
    saveUsers(users);

    // Generate mock token
    const mockToken = `mock_token_${Date.now()}_${users[userIndex].id}`;

    return {
      success: true,
      message: 'Account activated successfully',
      data: {
        userId: users[userIndex].id,
        email: users[userIndex].email,
        token: mockToken,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Verification failed',
      error: 'An error occurred during verification. Please try again.',
    };
  }
};

/**
 * Login user (check if email exists and account is active)
 */
export const loginUser = async (email: string): Promise<AuthResponse> => {
  await delay(600);

  try {
    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'No account found with this email. Please sign up first.',
      };
    }

    if (user.status !== 'active') {
      return {
        success: false,
        message: 'Account not activated',
        error: 'Please complete your registration by verifying your email.',
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      data: {
        userId: user.id,
        email: user.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Login failed',
      error: 'An error occurred during login. Please try again.',
    };
  }
};

/**
 * Verify login OTP and generate session
 */
export const verifyLoginOTP = async (email: string): Promise<AuthResponse> => {
  await delay(600);

  try {
    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'User account not found.',
      };
    }

    // Generate mock token
    const mockToken = `mock_token_${Date.now()}_${user.id}`;

    // Store auth session
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_email', user.email);
    localStorage.setItem('user_role', user.role);

    return {
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        email: user.email,
        token: mockToken,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Login verification failed',
      error: 'An error occurred. Please try again.',
    };
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = (email: string): MockUser | null => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Logout user
 */
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
};


