import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const AnnouncementAPI = {
    // Get all announcements
    getAllAnnouncements: async () => {
        try {
            const response = await api.get('/announcements');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get announcement by ID
    getAnnouncementById: async (id) => {
        try {
            const response = await api.get(`/announcements/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new announcement
    createAnnouncement: async (announcementData) => {
        try {
            const response = await api.post('/announcements', announcementData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update announcement
    updateAnnouncement: async (id, announcementData) => {
        try {
            const response = await api.put(`/announcements/${id}`, announcementData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete announcement
    deleteAnnouncement: async (id, userId) => {
        try {
            const response = await api.delete(`/announcements/${id}?userId=${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 