/**
 * Authentication API Service
 * Handles authentication-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  userId?: number;
  username?: string;
  email?: string;
  error?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AdminProfile {
  username: string;
  email: string;
  lastLoginTime: string;
}

/**
 * Store token in localStorage
 */
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

/**
 * Get token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Remove token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Signup - Create new admin account
 */
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Signup failed',
      };
    }

    return {
      success: true,
      message: result.message || 'Account created successfully',
      userId: result.userId,
      username: result.username,
      email: result.email,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create account',
    };
  }
};

/**
 * Login - Authenticate admin user
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Login failed',
      };
    }

    // Store token
    if (result.token) {
      setAuthToken(result.token);
    }

    return {
      success: true,
      message: result.message || 'Login successful',
      token: result.token,
      userId: result.userId,
      username: result.username,
      email: result.email,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to login',
    };
  }
};

/**
 * Logout - Clear authentication
 */
export const logout = () => {
  removeAuthToken();
};

/**
 * Get admin profile details for the currently authenticated user.
 * Uses the JWT token and calls /api/auth/me on the backend.
 */
export const getAdminProfile = async (): Promise<{ success: boolean; data?: AdminProfile; error?: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = result.data as {
      username: string;
      email: string;
      lastLoginTime?: string;
    };

    return {
      success: true,
      data: {
        username: data.username,
        email: data.email,
        lastLoginTime: data.lastLoginTime || new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch admin profile',
    };
  }
};