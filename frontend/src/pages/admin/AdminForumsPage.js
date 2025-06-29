import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Snackbar, Alert, TextField, InputAdornment, Chip, Typography,
  Card, CardContent, Grid, Avatar, Divider, Badge, Tooltip
} from '@mui/material';
import { 
  Delete, Visibility, Info, Search, AttachFile, 
  Person, CalendarToday, Comment, Download 
} from '@mui/icons-material';
import { ForumAPI } from '../../services/ForumAPI';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminForumsPage = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'with-attachments', 'without-attachments'

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
        imageAlt: 'Forum attachment',
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

  const handleDeleteForum = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the forum and all its comments!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await ForumAPI.deleteForum(id);
        setSnackbar({ open: true, message: 'Forum deleted successfully', severity: 'success' });
        fetchForums();
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to delete forum', severity: 'error' });
      }
    }
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

  // Filter forums based on search and status
  const filteredForums = forums.filter(forum => {
    const searchLower = search.toLowerCase();
    const matchesSearch = (
      forum.title.toLowerCase().includes(searchLower) ||
      forum.description.toLowerCase().includes(searchLower) ||
      (forum.author?.username && forum.author.username.toLowerCase().includes(searchLower)) ||
      (forum.author?.email && forum.author.email.toLowerCase().includes(searchLower))
    );

    if (filterStatus === 'with-attachments') {
      return matchesSearch && forum.attachment;
    } else if (filterStatus === 'without-attachments') {
      return matchesSearch && !forum.attachment;
    }

    return matchesSearch;
  });

  const getStats = () => {
    const totalForums = forums.length;
    const forumsWithAttachments = forums.filter(f => f.attachment).length;
    const totalComments = forums.reduce((sum, forum) => sum + (forum.comments?.length || 0), 0);
    
    return { totalForums, forumsWithAttachments, totalComments };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading forums...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header with Stats */}
      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom>Forum Management</Typography>
          <Typography variant="body2" color="textSecondary">
            Manage all forum posts and comments
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/community')}
        >
          View Public Forums
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Comment />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalForums}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Forums</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <AttachFile />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.forumsWithAttachments}</Typography>
                  <Typography variant="body2" color="textSecondary">With Attachments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalComments}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Comments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search forums..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment> 
          }}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <TextField
          select
          label="Filter by"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <option value="all">All Forums</option>
          <option value="with-attachments">With Attachments</option>
          <option value="without-attachments">Without Attachments</option>
        </TextField>
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
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Attachment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comments</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredForums.map((forum) => (
                <TableRow
                  key={forum.id}
                  sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {forum.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      maxWidth: 200, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {forum.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                        {forum.author?.username?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body2">
                        {forum.author?.username || forum.author?.email || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {forum.attachment ? (
                      <Tooltip title="Click to view/download">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleAttachmentClick(forum.attachment)}
                          size="small"
                        >
                          {getAttachmentIcon(forum.attachment)}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="textSecondary">None</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge badgeContent={forum.comments?.length || 0} color="primary">
                      <Comment />
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(forum.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton color="info" onClick={() => setSelectedForum(forum)}>
                        <Info />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Public Page">
                      <IconButton color="primary" onClick={() => navigate(`/community/${forum.id}`)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Forum">
                      <IconButton color="error" onClick={() => handleDeleteForum(forum.id)}>
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
          {filteredForums.map((forum) => (
            <Grid item xs={12} md={6} lg={4} key={forum.id}>
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
                      {forum.title}
                    </Typography>
                    {forum.attachment && (
                      <Tooltip title="Click to view/download">
                        <IconButton 
                          size="small" 
                          onClick={() => handleAttachmentClick(forum.attachment)}
                        >
                          {getAttachmentIcon(forum.attachment)}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ 
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {forum.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: '0.7rem' }}>
                      {forum.author?.username?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography variant="caption">
                      {forum.author?.username || forum.author?.email || 'Unknown'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="caption">
                        {new Date(forum.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Badge badgeContent={forum.comments?.length || 0} color="primary" size="small">
                        <Comment fontSize="small" />
                      </Badge>
                    </Box>
                  </Box>
                </CardContent>

                <Divider />
                
                <Box display="flex" justifyContent="space-around" p={1}>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => setSelectedForum(forum)}>
                      <Info />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Public Page">
                    <IconButton size="small" onClick={() => navigate(`/community/${forum.id}`)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Forum">
                    <IconButton size="small" color="error" onClick={() => handleDeleteForum(forum.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Forum Details Dialog */}
      <Dialog open={!!selectedForum} onClose={() => setSelectedForum(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: '#1976d2', color: '#fff' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Forum Details</Typography>
            {selectedForum?.attachment && (
              <Tooltip title="Download Attachment">
                <IconButton 
                  color="inherit" 
                  onClick={() => handleAttachmentClick(selectedForum.attachment)}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ background: '#fafbfc' }}>
          {selectedForum && (
            <Box sx={{ py: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom>{selectedForum.title}</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedForum.description}</Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      {selectedForum.author?.username?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {selectedForum.author?.username || selectedForum.author?.email || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(selectedForum.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedForum.attachment && (
                    <Chip 
                      icon={<AttachFile />} 
                      label="Has Attachment" 
                      color="primary" 
                      variant="outlined"
                      onClick={() => handleAttachmentClick(selectedForum.attachment)}
                      clickable
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Comments ({selectedForum.comments?.length || 0})
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  {selectedForum.comments && selectedForum.comments.length > 0 ? (
                    selectedForum.comments.map(comment => (
                      <Box key={comment.id} sx={{ 
                        mb: 2, 
                        p: 2, 
                        borderRadius: 1, 
                        background: '#f5f5f5',
                        border: '1px solid #e0e0e0'
                      }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.7rem' }}>
                              {comment.author?.username?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="subtitle2">
                              {comment.author?.username || comment.author?.email || 'Unknown'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{comment.content}</Typography>
                        
                        {user?.role === 'ADMIN' && (
                          <Box display="flex" justifyContent="flex-end" mt={1}>
                            <Tooltip title="Delete Comment">
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
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      No comments yet.
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ background: '#fafbfc' }}>
          <Button onClick={() => navigate(`/community/${selectedForum?.id}`)} variant="contained">
            View Public Page
          </Button>
          <Button onClick={() => setSelectedForum(null)} variant="outlined">
            Close
          </Button>
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