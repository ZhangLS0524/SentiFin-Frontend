import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const AlertAPI = {
  // Get all alerts for a user
  getAlertsByUserId: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/alerts/user/${userId}`);
    return response.data;
  },

  // Create a new alert
  createAlert: async (alert) => {
    const response = await axios.post(`${API_BASE_URL}/alerts`, alert);
    return response.data;
  },

  // Delete an alert by id
  deleteAlert: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/alerts/${id}`);
    return response.data;
  },

  // Update an alert by id
  updateAlert: async (id, alert) => {
    const response = await axios.put(`${API_BASE_URL}/alerts/${id}`, alert);
    return response.data;
  },

  // Get alert by id
  getAlertById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/alerts/${id}`);
    return response.data;
  },

  // Reset an alert by id
  resetAlert: async (id) => {
    const response = await axios.put(`${API_BASE_URL}/alerts/${id}/reset`);
    return response.data;
  }
}; 