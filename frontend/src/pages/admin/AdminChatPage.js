import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Snackbar, Alert, TextField, InputAdornment, Select, MenuItem, CircularProgress
} from '@mui/material';
import { Delete, Edit, Group, Search, Visibility, PersonRemove, Person, AdminPanelSettings } from '@mui/icons-material';
import { chatService } from '../../services/ChatAPI';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ chatName: '', chatType: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [addUserId, setAddUserId] = useState('');
  const [addUserAdmin, setAddUserAdmin] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchChats();
    chatService.getAllUsers().then(setAllUsers).catch(() => {});
  }, [user, navigate]);

  const fetchChats = () => {
    setLoading(true);
    chatService.getAllChats()
      .then(setChats)
      .catch(() => setSnackbar({ open: true, message: 'Failed to load chats', severity: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setMessageLoading(true);
    try {
      const [parts, msgs] = await Promise.all([
        chatService.getParticipantsByChatId(chat.id),
        chatService.getChatMessages(chat.id)
      ]);
      setParticipants(parts);
      setMessages(msgs);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load chat details', severity: 'error' });
    } finally {
      setMessageLoading(false);
    }
  };

  const handleEditChat = (chat) => {
    setEditForm({ chatName: chat.chatName, chatType: chat.chatType });
    setSelectedChat(chat);
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      await chatService.updateChat(selectedChat.id, editForm);
      setSnackbar({ open: true, message: 'Chat updated', severity: 'success' });
      setEditDialogOpen(false);
      fetchChats();
    } catch {
      setSnackbar({ open: true, message: 'Failed to update chat', severity: 'error' });
    }
  };

  const handleDeleteChat = (chat) => {
    setDeleteTarget(chat);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteChat = async () => {
    try {
      await chatService.deleteChat(deleteTarget.id);
      setSnackbar({ open: true, message: 'Chat deleted', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedChat(null);
      fetchChats();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete chat', severity: 'error' });
    }
  };

  const handleAddParticipant = async () => {
    if (!addUserId) return;
    try {
      await chatService.addParticipants(selectedChat.id, addUserId, addUserAdmin);
      setSnackbar({ open: true, message: 'Participant added', severity: 'success' });
      setAddUserId('');
      setAddUserAdmin(false);
      handleSelectChat(selectedChat);
    } catch {
      setSnackbar({ open: true, message: 'Failed to add participant', severity: 'error' });
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      await chatService.deleteParticipant(participantId);
      setSnackbar({ open: true, message: 'Participant removed', severity: 'success' });
      handleSelectChat(selectedChat);
    } catch {
      setSnackbar({ open: true, message: 'Failed to remove participant', severity: 'error' });
    }
  };

  const handleChangeAdmin = async (participant) => {
    try {
      await chatService.updateParticipant(participant.id, {
        chatId: selectedChat.id,
        userId: participant.user.id,
        isAdmin: !participant.isAdmin
      });
      setSnackbar({ open: true, message: 'Admin status updated', severity: 'success' });
      handleSelectChat(selectedChat);
    } catch {
      setSnackbar({ open: true, message: 'Failed to update admin status', severity: 'error' });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // Assume chatService has deleteMessage, or implement if needed
      await chatService.deleteMessage(messageId);
      setSnackbar({ open: true, message: 'Message deleted', severity: 'success' });
      handleSelectChat(selectedChat);
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete message', severity: 'error' });
    }
  };

  // Filter chats by search
  const filteredChats = chats.filter(chat =>
    chat.chatName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <h2>Chat Room Management</h2>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search by chat name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          size="small"
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Chat Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChats.map(chat => (
                <TableRow key={chat.id} selected={selectedChat?.id === chat.id}>
                  <TableCell>{chat.chatName}</TableCell>
                  <TableCell>{chat.chatType}</TableCell>
                  <TableCell>
                    <IconButton color="info" onClick={() => handleSelectChat(chat)} title="View Details">
                      <Visibility />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleEditChat(chat)} title="Edit Chat">
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteChat(chat)} title="Delete Chat">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Chat Details */}
      {selectedChat && (
        <Box sx={{ mb: 3 }}>
          <h3>Chat Details: {selectedChat.chatName}</h3>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Participants */}
            <Box sx={{ minWidth: 350 }}>
              <h4>Participants</h4>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.user?.username}</TableCell>
                        <TableCell>{p.isAdmin ? 'Admin' : 'User'}</TableCell>
                        <TableCell>
                          <IconButton color="warning" onClick={() => handleChangeAdmin(p)} title="Toggle Admin">
                            <AdminPanelSettings />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleRemoveParticipant(p.id)} title="Remove Participant">
                            <PersonRemove />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Add participant */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Select
                  value={addUserId}
                  onChange={e => setAddUserId(e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="" disabled>Select User</MenuItem>
                  {allUsers.filter(u => !participants.some(p => p.user?.id === u.id)).map(u => (
                    <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
                  ))}
                </Select>
                <Button
                  variant={addUserAdmin ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setAddUserAdmin(a => !a)}
                  startIcon={<Person />}
                >
                  {addUserAdmin ? 'Admin' : 'User'}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddParticipant}
                  disabled={!addUserId}
                  startIcon={<Group />}
                >
                  Add
                </Button>
              </Box>
            </Box>
            {/* Messages */}
            <Box sx={{ minWidth: 350 }}>
              <h4>Messages</h4>
              {messageLoading ? (
                <CircularProgress size={24} />
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 250, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sender</TableCell>
                        <TableCell>Content</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {messages.map(m => (
                        <TableRow key={m.id}>
                          <TableCell>{m.sender?.username}</TableCell>
                          <TableCell>{m.content}</TableCell>
                          <TableCell>{new Date(m.timestamp || m.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => handleDeleteMessage(m.id)} title="Delete Message">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Edit Chat Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Chat</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Chat Name"
            name="chatName"
            value={editForm.chatName}
            onChange={handleEditFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Chat Type"
            name="chatType"
            value={editForm.chatType}
            onChange={handleEditFormChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this chat? This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteChat} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminChatPage; 