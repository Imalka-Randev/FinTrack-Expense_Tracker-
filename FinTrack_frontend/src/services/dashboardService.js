import api from './api';

export const dashboardService = {
  /**
   * Fetch financial summary, expense category breakdown,
   * daily income vs expense time-series, and recent 5 transactions.
   * @param {{ month?: number, year?: number }} params
   */
  async getDashboard(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );

    const response = await api.get('/dashboard', { params: cleanParams });
    return response.data.data;
  },
};

export default dashboardService;
