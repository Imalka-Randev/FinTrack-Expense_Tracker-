import api from './api';

export const budgetService = {
  /**
   * Fetch all budgets with actual spending progress
   * @param {{ month?: number, year?: number, category?: string }} params
   */
  async getBudgets(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );

    const response = await api.get('/budgets', { params: cleanParams });
    return response.data.data.budgets;
  },

  /**
   * Fetch a single budget by ID
   * @param {string} id
   */
  async getBudgetById(id) {
    const response = await api.get(`/budgets/${id}`);
    return response.data.data.budget;
  },

  /**
   * Create a new monthly budget limit for a category
   * @param {{ category: string, amount: number, month: number, year: number }} data
   */
  async createBudget(data) {
    const response = await api.post('/budgets', data);
    return response.data.data.budget;
  },

  /**
   * Update budget limit or category
   * @param {string} id
   * @param {{ amount?: number, category?: string }} data
   */
  async updateBudget(id, data) {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data.data.budget;
  },

  /**
   * Delete a budget
   * @param {string} id
   */
  async deleteBudget(id) {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

export default budgetService;
