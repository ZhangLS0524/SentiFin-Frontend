import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Helper function to process forum data and remove nested references
const processForumData = (forum) => {
    return {
        ...forum,
        comments: forum.comments?.map(comment => ({
            id: comment.id,
            createdAt: comment.createdAt,
            content: comment.content,
            author: comment.author
        })) || []
    };
};

export const ForumAPI = {
    // Get all forum posts
    getAllForums: async () => {
        try {
            const response = await axios.get(`${API_URL}/forum`);
            if (!response.data) return [];
            return Array.isArray(response.data) ? response.data.map(processForumData) : [];
        } catch (error) {
            throw error;
        }
    },

    // Get a specific forum post by ID
    getForumById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/forum/${id}`);
            if (!response.data) return null;
            return processForumData(response.data);
        } catch (error) {
            throw error;
        }
    },

    // Create a new forum post
    createForum: async (forumData) => {
        try {
            const requestData = {
                title: forumData.title,
                description: forumData.description,
                author: forumData.author,
                attachment: forumData.attachment ? forumData.attachment.name : null
            };

            const response = await axios.post(`${API_URL}/forum`, requestData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update a forum post
    updateForum: async (id, forumData) => {
        try {
            const requestData = {
                title: forumData.title,
                description: forumData.description,
                author: forumData.userId,
                attachment: forumData.attachment ? forumData.attachment.name : null
            };

            const response = await axios.put(`${API_URL}/forum/${id}`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete a forum post
    deleteForum: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/forum/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get comments for a forum post
    getForumComments: async (forumId) => {
        try {
            const response = await axios.get(`${API_URL}/forum/${forumId}/comments`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // POST comment for a forum post
    postComment: async (commentData) => {
        try {
            const requestData = {
                forumId: commentData.forumId,
                content: commentData.content,
                author: commentData.author
            };

            const response = await axios.post(`${API_URL}/comments`, requestData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete a comment by ID
    deleteComment: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/comments/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}; 