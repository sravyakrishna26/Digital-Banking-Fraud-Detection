/**
 * Transaction API Service
 * Handles all API calls to the backend Spring Boot API
 */

import { getAuthToken } from './authApi';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Get headers with authentication token
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export interface Transaction {
  transactionId: string;
  timestamp?: string;
  timestampVal?: string;
  currency: string;
  amount: number;
  senderAccount: string;
  receiverAccount: string;
  transactionType?: string;
  channel?: string;
  status?: string;
  ipAddress?: string;
  location?: string;
  fraudFlag?: boolean | number;
  fraudReason?: string;
  mlPrediction?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Create a new transaction
 */
export const createTransaction = async (transaction: Omit<Transaction, 'status' | 'fraudFlag' | 'fraudReason' | 'timestampVal'>): Promise<ApiResponse<string>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = null;

      try {
        const errorData = await response.json();
        errorDetails = errorData;

        // Handle validation errors from Spring Boot
        if (Array.isArray(errorData)) {
          // Format validation errors
          const errors = errorData.map((err: any) => {
            const field = err.field || err.objectName || 'field';
            const message = err.defaultMessage || err.message || 'Invalid value';
            return `${field}: ${message}`;
          }).join(', ');
          errorMessage = `Validation failed: ${errors}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch (e2) {
          // Keep default error message
        }
      }

      return {
        success: false,
        error: errorMessage,
        details: errorDetails,
      };
    }

    const data = await response.text();
    return {
      success: true,
      data: data || 'Transaction saved successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create transaction',
    };
  }
};

/**
 * Get all transactions
 */
export const getAllTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
};

/**
 * Get fraud transactions
 */
export const getFraudTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/fraud`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch fraud transactions',
    };
  }
};

/**
 * Get successful transactions
 */
export const getSuccessTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/success`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch success transactions',
    };
  }
};

/**
 * Get failed transactions
 */
export const getFailedTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/failed`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch failed transactions',
    };
  }
};

/**
 * Get pending transactions
 */
export const getPendingTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/pending`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pending transactions',
    };
  }
};

/* ================= DASHBOARD APIs ================= */

export interface DashboardSummary {
  totalTransactions: number;
  fraudTransactions: number;
  successTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  fraudPercentage: number;
}

export interface FraudTrend {
  date: string;
  fraudCount: number;
}

export interface ChannelWiseFraud {
  channel: string;
  fraudCount: number;
  nonFraudCount: number;
  totalCount: number;
}

export interface LocationWiseFraud {
  location: string;
  fraudCount: number;
  totalTransactions: number;
}

/**
 * Get dashboard summary
 */
export const getDashboardSummary = async (): Promise<ApiResponse<DashboardSummary>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
    };
  }
};

/**
 * Get fraud trends
 */
export const getFraudTrends = async (): Promise<ApiResponse<FraudTrend[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/fraud-trends`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch fraud trends',
    };
  }
};

/**
 * Get channel-wise fraud data
 */
export const getChannelWiseFraud = async (): Promise<ApiResponse<ChannelWiseFraud[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/channel-wise`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch channel-wise fraud data',
    };
  }
};

/**
 * Get location-wise fraud data
 */
export const getLocationWiseFraud = async (): Promise<ApiResponse<LocationWiseFraud[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/location-wise`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch location-wise fraud data',
    };
  }
};

/* ================= ACCOUNT STATUS APIs ================= */

export interface AccountStatus {
  accountNumber: string;
  status: 'ACTIVE' | 'BLOCKED';
  blockedAt?: string;
  unblockAt?: string;
  failedCountLast5Min?: number;
}

export interface BlockedAccount extends AccountStatus {
  accountId?: string;
  accountHolderName?: string;
  blockReason?: string;
}

export interface BlockedAccountsResponse {
  count: number;
  accounts: BlockedAccount[];
}

/**
 * Get account status by account number
 */
export const getAccountStatus = async (accountNumber: string): Promise<ApiResponse<AccountStatus>> => {
  try {
    // Check if user is authenticated before making the request
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/accounts/status/${encodeURIComponent(accountNumber)}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      // Handle 404 Not Found - account doesn't exist yet, default to ACTIVE
      if (response.status === 404) {
        return {
          success: true,
          data: {
            accountNumber: accountNumber,
            status: 'ACTIVE',
            failedCountLast5Min: 0
          }
        };
      }
      // Handle 403 Forbidden (authentication/authorization issue)
      if (response.status === 403) {
        return {
          success: false,
          error: 'HTTP 403: Forbidden - Authentication required',
        };
      }
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch account status',
    };
  }
};

/**
 * Get all blocked accounts
 */
export const getBlockedAccounts = async (): Promise<ApiResponse<BlockedAccountsResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/blocked`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch blocked accounts',
    };
  }
};
