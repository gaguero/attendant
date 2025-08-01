import { AuthTokens } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';
const TOKEN_STORAGE_KEY = 'attendandt_tokens';

// Helper to get tokens from storage
const getAuthTokens = (): AuthTokens | null => {
  try {
    const data = localStorage.getItem(TOKEN_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to read tokens from localStorage:', error);
    return null;
  }
};

export const httpClient = async (
  endpoint: string,
  options: RequestInit = {},
  authenticated = false
) => {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authenticated) {
    const tokens = getAuthTokens();
    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData;
    try {
      // Try to parse the error response as JSON
      errorData = await response.json();
    } catch (e) {
      // If parsing fails, use the status text
      errorData = { message: response.statusText };
    }
    throw new Error(
      errorData.message || errorData.error || `Request failed with status ${response.status}`
    );
  }

  // If the response is successful but has no content, return null
  if (response.status === 204) {
    return null;
  }

  // Only parse JSON if there's content
  return response.json();
}; 