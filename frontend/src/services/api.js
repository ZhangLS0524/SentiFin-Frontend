import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const userService = {
    // Register a new user
    register: async (userData) => {
        try {
            const response = await api.post('/user', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all users
    getAllUsers: async () => {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user by ID
    getUserById: async (id) => {
        try {
            const response = await api.get(`/user/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update user
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/user/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete user
    deleteUser: async (id, userId) => {
        try {
            const response = await api.delete(`/user/${id}?userId=${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 