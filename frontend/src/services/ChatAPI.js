import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatService = {
    // Create a new chat
    createChat: async (chatData) => {
        try {
            const response = await api.post('/chat', chatData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add participants to a chat
    addParticipants: async (chatId, userIds, isAdmin = false) => {
        try {
            // Convert single userId to array for consistent handling
            const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
            
            // Create an array of promises for each user
            const addParticipantPromises = userIdArray.map(userId => 
                api.post(`/participant/chat/${chatId}/user/${userId}`, {
                    chatId,
                    userId,
                    isAdmin
                })
            );

            // Wait for all participants to be added
            const responses = await Promise.all(addParticipantPromises);
            return responses.map(response => response.data);
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getChatByUserId: async (userId) => {
        try {
            const response = await api.get(`/chat/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all users for chat creation
    getAllUsers: async () => {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get chat messages
    getChatMessages: async (chatId) => {
        try {
            const response = await api.get(`/message/chat/${chatId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Send a message
    sendMessage: async (chatId, message, userId, attachment = null) => {
        try {
            if (attachment) {
                // If there's an attachment, use FormData
                const formData = new FormData();
                formData.append('content', message);
                formData.append('attachment', attachment);
                formData.append('chatId', chatId);
                formData.append('senderId', userId);

                const response = await api.post(`/message/chat/${chatId}/user/${userId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                // If no attachment, send as regular JSON
                const messageData = {
                    content: message,
                    chatId: chatId,
                    senderId: userId
                };
                const response = await api.post(`/message/chat/${chatId}/user/${userId}`, messageData);
                return response.data;
            }
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all chats (admin)
    getAllChats: async () => {
        try {
            const response = await api.get('/chat');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update a chat (admin)
    updateChat: async (chatId, chatData) => {
        try {
            const response = await api.put(`/chat/${chatId}`, chatData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a chat (admin)
    deleteChat: async (chatId) => {
        try {
            const response = await api.delete(`/chat/${chatId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all participants in a chat (admin)
    getParticipantsByChatId: async (chatId) => {
        try {
            const response = await api.get(`/participant/chat/${chatId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update a participant (admin)
    updateParticipant: async (participantId, participantData) => {
        try {
            const response = await api.put(`/participant/${participantId}`, participantData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a participant (admin)
    deleteParticipant: async (participantId) => {
        try {
            const response = await api.delete(`/participant/${participantId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a message (admin)
    deleteMessage: async (messageId) => {
        try {
            const response = await api.delete(`/message/${messageId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
}; 