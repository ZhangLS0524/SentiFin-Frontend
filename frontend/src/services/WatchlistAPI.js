import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const WatchlistAPI = {
    // Get watchlist by ID
    getWatchlistById: async (id) => {
        try {
            const response = await api.get(`/watchlist/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get watchlist by user ID
    getWatchlistByUserId: async (userId) => {
        try {
            const response = await api.get(`/watchlist/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new watchlist
    createWatchlist: async (watchlistData) => {
        try {
            const response = await api.post('/watchlist', watchlistData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update watchlist
    updateWatchlist: async (id, watchlistData) => {
        try {
            const response = await api.put(`/watchlist/${id}`, watchlistData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete watchlist
    deleteWatchlist: async (id, userId) => {
        try {
            const response = await api.delete(`/watchlist/${id}?userId=${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
}; 