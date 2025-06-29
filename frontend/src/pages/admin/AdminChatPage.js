import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Snackbar, Alert, TextField, InputAdornment, Select, MenuItem, 
  CircularProgress, Chip, Typography, Card, CardContent, Grid, Avatar, 
  Divider, Badge, Tooltip, FormControl, InputLabel
} from '@mui/material';
import { 
  Delete, Edit, Group, Search, Visibility, PersonRemove, Person, 
  AdminPanelSettings, Message, Chat, Lock
} from '@mui/icons-material';
import { chatService } from '../../services/ChatAPI';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
  const [allUsers, setAllUsers] = useState([]);
  const [addUserId, setAddUserId] = useState('');
  const [addUserAdmin, setAddUserAdmin] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [filterType, setFilterType] = useState('all'); // 'all', 'PRIVATE', 'GROUP'
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const fetchChats = useCallback(() => {
    setLoading(true);
    chatService.getAllChats()
      .then(setChats)
      .catch(() => setSnackbar({ open: true, message: 'Failed to load chats', severity: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchChats();
    chatService.getAllUsers().then(setAllUsers).catch(() => {});
  }, [user, navigate, fetchChats]);

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

  const handleShowDetails = async (chat) => {
    await handleSelectChat(chat);
    setShowDetailsDialog(true);
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

  const handleDeleteChat = async (chat) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the chat and all its messages!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await chatService.deleteChat(chat.id);
        setSnackbar({ open: true, message: 'Chat deleted successfully', severity: 'success' });
        setSelectedChat(null);
        fetchChats();
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to delete chat', severity: 'error' });
      }
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

  // Filter chats by search and type
  const filteredChats = chats.filter(chat => {
    const searchLower = search.toLowerCase();
    const matchesSearch = chat.chatName.toLowerCase().includes(searchLower);
    
    if (filterType === 'all') {
      return matchesSearch;
    }
    return matchesSearch && chat.chatType === filterType;
  });

  const getStats = () => {
    const totalChats = chats.length;
    const privateChats = chats.filter(c => c.chatType === 'PRIVATE').length;
    const groupChats = chats.filter(c => c.chatType === 'GROUP').length;
    const totalMessages = messages.length;
    const totalParticipants = participants.length;
    
    return { totalChats, privateChats, groupChats, totalMessages, totalParticipants };
  };

  const stats = getStats();

  // Function to handle attachment display
  const handleAttachmentClick = (attachment) => {
    if (!attachment) return;
    
    // Check if it's an image
    if (attachment.startsWith('data:image')) {
      Swal.fire({
        title: 'Attachment',
        imageUrl: attachment,
        imageWidth: '100%',
        imageHeight: 'auto',
        imageAlt: 'Chat attachment',
        confirmButtonText: 'Close'
      });
    } else {
      // For non-image files, trigger download
      const link = document.createElement('a');
      link.href = attachment;
      
      // Extract filename from base64 or use default
      let filename = 'attachment';
      if (attachment.includes('pdf')) {
        filename = 'document.pdf';
      } else if (attachment.includes('doc')) {
        filename = 'document.doc';
      } else if (attachment.includes('docx')) {
        filename = 'document.docx';
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Function to get attachment icon based on file type
  const getAttachmentIcon = (attachment) => {
    if (!attachment) return null;
    
    if (attachment.startsWith('data:image')) {
      return '🖼️';
    } else if (attachment.includes('pdf')) {
      return '📄';
    } else if (attachment.includes('doc')) {
      return '📝';
    } else {
      return '📎';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header with Stats */}
      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom>Chat Management</Typography>
          <Typography variant="body2" color="textSecondary">
            Manage all chat rooms and participants
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/chat')}
        >
          View Public Chat
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Chat />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalChats}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Chats</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Lock />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.privateChats}</Typography>
                  <Typography variant="body2" color="textSecondary">Private Chats</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Group />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.groupChats}</Typography>
                  <Typography variant="body2" color="textSecondary">Group Chats</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search chats..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment> 
          }}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Filter by Type"
          >
            <MenuItem value="all">All Chats</MenuItem>
            <MenuItem value="PRIVATE">Private Chats</MenuItem>
            <MenuItem value="GROUP">Group Chats</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant={viewMode === 'table' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('table')}
          size="small"
        >
          Table View
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('grid')}
          size="small"
        >
          Grid View
        </Button>
      </Box>

      {/* Table View */}
      {viewMode === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Chat Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Participants</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Messages</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChats.map(chat => (
                <TableRow key={chat.id} selected={selectedChat?.id === chat.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {chat.chatName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={chat.chatType === 'PRIVATE' ? <Lock /> : <Group />}
                      label={chat.chatType}
                      color={chat.chatType === 'PRIVATE' ? 'default' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge badgeContent={participants.length} color="primary">
                      <Person />
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge badgeContent={messages.length} color="secondary">
                      <Message />
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton color="info" onClick={() => handleShowDetails(chat)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Chat">
                      <IconButton color="primary" onClick={() => handleEditChat(chat)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Chat">
                      <IconButton color="error" onClick={() => handleDeleteChat(chat)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Grid container spacing={2}>
          {filteredChats.map(chat => (
            <Grid item xs={12} md={6} lg={4} key={chat.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.2
                    }}>
                      {chat.chatName}
                    </Typography>
                    <Chip 
                      icon={chat.chatType === 'PRIVATE' ? <Lock /> : <Group />}
                      label={chat.chatType}
                      color={chat.chatType === 'PRIVATE' ? 'default' : 'primary'}
                      size="small"
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="caption">
                        {participants.length} participants
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Message fontSize="small" color="action" />
                      <Typography variant="caption">
                        {messages.length} messages
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Divider />
                
                <Box display="flex" justifyContent="space-around" p={1}>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleShowDetails(chat)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Chat">
                    <IconButton size="small" onClick={() => handleEditChat(chat)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Chat">
                    <IconButton size="small" color="error" onClick={() => handleDeleteChat(chat)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Enhanced Chat Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: '#1976d2', color: '#fff' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chat Details: {selectedChat?.chatName}</Typography>
            <Chip 
              icon={selectedChat?.chatType === 'PRIVATE' ? <Lock /> : <Group />}
              label={selectedChat?.chatType}
              color={selectedChat?.chatType === 'PRIVATE' ? 'default' : 'primary'}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ background: '#fafbfc' }}>
          {selectedChat && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                {/* Participants Section */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Participants ({participants.length})
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                    {participants.length > 0 ? (
                      participants.map(p => (
                        <Box key={p.id} sx={{ 
                          mb: 2, 
                          p: 2, 
                          borderRadius: 1, 
                          background: '#f5f5f5',
                          border: '1px solid #e0e0e0'
                        }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                                {p.user?.username?.charAt(0) || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {p.user?.username || p.user?.email || 'Unknown'}
                                </Typography>
                                <Chip 
                                  label={p.isAdmin ? 'Admin' : 'User'} 
                                  size="small"
                                  color={p.isAdmin ? 'primary' : 'default'}
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            <Box display="flex" gap={1}>
                              <Tooltip title={p.isAdmin ? 'Remove Admin' : 'Make Admin'}>
                                <IconButton
                                  color="warning"
                                  size="small"
                                  onClick={() => handleChangeAdmin(p)}
                                >
                                  <AdminPanelSettings />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove Participant">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleRemoveParticipant(p.id)}
                                >
                                  <PersonRemove />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                        No participants yet.
                      </Box>
                    )}
                  </Paper>

                  {/* Add Participant Section */}
                  <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Add New Participant</Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={addUserId}
                          onChange={e => setAddUserId(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>Select User</MenuItem>
                          {allUsers.filter(u => !participants.some(p => p.user?.id === u.id)).map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.username || u.email}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                </Grid>

                {/* Messages Section */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Messages ({messages.length})
                  </Typography>
                  {messageLoading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
                      {messages.length > 0 ? (
                        messages.map(m => (
                          <Box key={m.id} sx={{ 
                            mb: 2, 
                            p: 2, 
                            borderRadius: 1, 
                            background: '#f5f5f5',
                            border: '1px solid #e0e0e0'
                          }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.7rem' }}>
                                  {m.sender?.username?.charAt(0) || 'U'}
                                </Avatar>
                                <Typography variant="subtitle2">
                                  {m.sender?.username || m.sender?.email || 'Unknown'}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="textSecondary">
                                {new Date(m.createdAt || m.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>{m.content}</Typography>
                            
                            {/* Attachment Display */}
                            {m.attachment && (
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Tooltip title="Click to view/download">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleAttachmentClick(m.attachment)}
                                  >
                                    {getAttachmentIcon(m.attachment)}
                                  </IconButton>
                                </Tooltip>
                                <Typography variant="caption" color="textSecondary">
                                  Attachment
                                </Typography>
                              </Box>
                            )}
                            
                            <Box display="flex" justifyContent="flex-end">
                              <Tooltip title="Delete Message">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteMessage(m.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                          No messages yet.
                        </Box>
                      )}
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ background: '#fafbfc' }}>
          <Button onClick={() => setShowDetailsDialog(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Chat Type</InputLabel>
            <Select
              name="chatType"
              value={editForm.chatType}
              onChange={handleEditFormChange}
              label="Chat Type"
            >
              <MenuItem value="PRIVATE">Private Chat</MenuItem>
              <MenuItem value="GROUP">Group Chat</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Update</Button>
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