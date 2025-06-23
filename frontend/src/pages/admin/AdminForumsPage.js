import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Snackbar, Alert, TextField, InputAdornment
} from '@mui/material';
import { Delete, Visibility, Info, Search } from '@mui/icons-material';
import { ForumAPI } from '../../services/ForumAPI';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // adjust path if needed

const AdminForumsPage = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchForums = useCallback(() => {
    setLoading(true);
    ForumAPI.getAllForums()
      .then(setForums)
      .catch(() => setSnackbar({ open: true, message: 'Failed to load forums', severity: 'error' }))
      .finally(() => setLoading(false));
  }, [setLoading, setForums, setSnackbar]);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  const handleDeleteForum = (id) => {
    ForumAPI.deleteForum(id)
      .then(() => {
        setSnackbar({ open: true, message: 'Forum deleted', severity: 'success' });
        fetchForums();
      })
      .catch(() => setSnackbar({ open: true, message: 'Delete failed', severity: 'error' }));
  };

  // Helper to refresh selected forum details after comment deletion
  const refreshSelectedForum = async (forumId) => {
    try {
      const updatedForum = await ForumAPI.getForumById(forumId);
      setSelectedForum(updatedForum);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to refresh forum details', severity: 'error' });
    }
  };

  // Filter forums based on search
  const filteredForums = forums.filter(forum => {
    const searchLower = search.toLowerCase();
    return (
      forum.title.toLowerCase().includes(searchLower) ||
      forum.description.toLowerCase().includes(searchLower) ||
      (forum.author?.username && forum.author.username.toLowerCase().includes(searchLower)) ||
      (forum.author?.email && forum.author.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
        <h2>Forum Management</h2>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search by title, description, or author"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          size="small"
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredForums.map((forum, idx) => (
              <TableRow
                key={forum.id}
                sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
              >
                <TableCell>{forum.title}</TableCell>
                <TableCell>{forum.description}</TableCell>
                <TableCell>{forum.author?.username || forum.author?.email || 'Unknown'}</TableCell>
                <TableCell>
                  <IconButton color="info" onClick={() => setSelectedForum(forum)}>
                    <Info />
                  </IconButton>
                  <IconButton color="primary" onClick={() => navigate(`/community/${forum.id}`)}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteForum(forum.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Forum Details Dialog */}
      <Dialog open={!!selectedForum} onClose={() => setSelectedForum(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: '#1976d2', color: '#fff' }}>
          Forum Details
        </DialogTitle>
        <DialogContent sx={{ background: '#fafbfc' }}>
          {selectedForum && (
            <Box sx={{ py: 2 }}>
              <Box sx={{ mb: 2 }}>
                <h3 style={{ margin: 0 }}>{selectedForum.title}</h3>
                <p style={{ color: '#555', margin: '8px 0' }}>{selectedForum.description}</p>
                <p style={{ fontSize: 14, color: '#888' }}>
                  <b>Author:</b> {selectedForum.author?.username || selectedForum.author?.email || 'Unknown'}
                </p>
              </Box>
              <Box sx={{ mt: 2 }}>
                <h4 style={{ marginBottom: 8 }}>Comments</h4>
                <Paper variant="outlined" sx={{ maxHeight: 250, overflow: 'auto', p: 1 }}>
                  {selectedForum.comments && selectedForum.comments.length > 0 ? (
                    selectedForum.comments.map(comment => (
                      <Box key={comment.id} sx={{ mb: 1, p: 1, borderRadius: 1, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          <b>{comment.author?.username || comment.author?.email || 'Unknown'}:</b> {comment.content}
                        </span>
                        {user?.role === 'ADMIN' && (
                          <IconButton
                            color="error"
                            size="small"
                            disabled={deletingCommentId === comment.id}
                            onClick={async () => {
                              setDeletingCommentId(comment.id);
                              try {
                                await ForumAPI.deleteComment(comment.id);
                                setSnackbar({ open: true, message: 'Comment deleted', severity: 'success' });
                                await refreshSelectedForum(selectedForum.id);
                              } catch (error) {
                                setSnackbar({ open: true, message: 'Failed to delete comment', severity: 'error' });
                              } finally {
                                setDeletingCommentId(null);
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ color: '#aaa', fontStyle: 'italic' }}>No comments yet.</Box>
                  )}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ background: '#fafbfc' }}>
          <Button onClick={() => setSelectedForum(null)} variant="outlined">Close</Button>
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

export default AdminForumsPage;