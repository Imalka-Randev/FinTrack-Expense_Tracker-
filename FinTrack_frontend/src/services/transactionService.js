import api from './api';

export const transactionService = {
  /**
   * Fetch all transactions with optional filters
   * @param {{ type?: string, category?: string, search?: string, startDate?: string, endDate?: string }} params
   */
  async getTransactions(params = {}) {
    // Filter out empty string/null values from query params
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );

    const response = await api.get('/transactions', { params: cleanParams });
    return response.data.data.transactions;
  },

  /**
   * Fetch a single transaction by ID
   * @param {string} id
   */
  async getTransactionById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data.transaction;
  },

  /**
   * Create a new transaction
   * @param {{ type: string, amount: number, category: string, description?: string, date?: string }} data
   */
  async createTransaction(data) {
    const response = await api.post('/transactions', data);
    return response.data.data.transaction;
  },

  /**
   * Update an existing transaction
   * @param {string} id
   * @param {Partial<{ type: string, amount: number, category: string, description?: string, date?: string }>} data
   */
  async updateTransaction(id, data) {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data.data.transaction;
  },

  /**
   * Delete a transaction
   * @param {string} id
   */
  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export default transactionService;
