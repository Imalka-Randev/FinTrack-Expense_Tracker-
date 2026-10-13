import api, { setStoredToken, clearStoredToken } from './api';

export const authService = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string }} data
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Log in user, store token and return token + user details
   * @param {{ email: string, password: string }} data
   * @param {boolean} remember
   */
  async login(data, remember = true) {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data.data;
    if (token) {
      setStoredToken(token, remember);
    }
    return { token, user };
  },

  /**
   * Fetch current authenticated user's profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  /**
   * Clear session token
   */
  logout() {
    clearStoredToken();
  },
};

export default authService;
