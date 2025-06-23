import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const TickerAPI = {
  // Get all tickers (optionally filtered by active status)
  getAllTickers: async (activeOnly = true) => {
    const url = activeOnly ? `${API_BASE_URL}/tickers/active` : `${API_BASE_URL}/tickers`;
    const response = await axios.get(url);
    return response.data;
  },

  // Get ticker by symbol
  getTickerBySymbol: async (symbol) => {
    const response = await axios.get(`${API_BASE_URL}/tickers/symbol/${symbol}`);
    return response.data;
  },

  // Get tickers by sector
  getTickersBySector: async (sector) => {
    const response = await axios.get(`${API_BASE_URL}/tickers/sector/${sector}`);
    return response.data;
  },

  // Create a new ticker
  createTicker: async (ticker) => {
    const response = await axios.post(`${API_BASE_URL}/tickers`, ticker);
    return response.data;
  },

  // Update a ticker
  updateTicker: async (id, ticker) => {
    const response = await axios.put(`${API_BASE_URL}/tickers/${id}`, ticker);
    return response.data;
  },

  // Delete a ticker
  deleteTicker: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/tickers/${id}`);
    return response.data;
  },

  // Get ticker by id
  getTickerById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/tickers/${id}`);
    return response.data;
  },

  // Get stock info/metrics for a ticker symbol from external API
  getStockInfo: async (symbol) => {
    const response = await axios.get(`http://localhost:8000/api/StockInfo/${symbol}`);
    return response.data;
  },

  getNewsSentiment: async ({ ticker, time_from, time_to, related_tickers }) => {
    const response = await axios.get(`http://localhost:8000/api/NewsSentiment`, {
        params: { ticker, time_from, time_to, related_tickers }
      });
      return response.data;
  }

  // 
}; 