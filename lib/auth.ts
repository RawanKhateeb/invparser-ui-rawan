const DUMMY_USERNAME = 'admin';
const DUMMY_PASSWORD = 'admin';
const AUTH_KEY = 'auth_token';

export const authService = {
  // Validate credentials
  validateCredentials: (username: string, password: string): boolean => {
    return username === DUMMY_USERNAME && password === DUMMY_PASSWORD;
  },

  // Login
  login: (username: string, password: string): boolean => {
    if (authService.validateCredentials(username, password)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, 'true');
      }
      return true;
    }
    return false;
  },

  // Logout
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_KEY) === 'true';
  },
};
