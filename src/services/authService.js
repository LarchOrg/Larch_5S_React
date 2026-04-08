const API_BASE_URL = 'https://localhost:7241/api';

export const authService = {
  /**
   * authenticates user and stores JWT session
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ EmailId: email, Password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Store auth data in localStorage for persistence
      if (data.token) {
        localStorage.setItem('fsa_token', data.token);
        localStorage.setItem('fsa_role', data.role);
        localStorage.setItem('fsa_user_name', data.fullName);
      }

      return data;
    } catch (error) {
      console.error("Login Service Error:", error);
      throw error;
    }
  },

  /**
   * Clears session
   */
  logout: () => {
    localStorage.removeItem('fsa_token');
    localStorage.removeItem('fsa_role');
    localStorage.removeItem('fsa_user_name');
  },

  getCurrentRole: () => localStorage.getItem('fsa_role'),
  getToken: () => localStorage.getItem('fsa_token'),
  getUserName: () => localStorage.getItem('fsa_user_name'),
  isAuthenticated: () => !!localStorage.getItem('fsa_token')
};