import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Snackbar, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, CircularProgress, TextField, MenuItem, InputAdornment, Select, Grid
} from '@mui/material';
import { Edit, Delete, Add, Search, Visibility } from '@mui/icons-material';
import { userService } from '../../services/api';

const defaultForm = {
  username: '', email: '', password: '', phoneNumber: '', altEmail: '', profilePicture: '', role: 'USER'
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [viewUser, setViewUser] = useState(null);

  // Replace with actual admin userId in production
  const adminUserId = 1;

  const fetchUsers = () => {
    setLoading(true);
    userService.getAllUsers()
      .then(users => setUsers(users))
      .catch(() => setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenForm = (user = null) => {
    setEditingId(user ? user.id : null);
    setForm(user ? { ...user, password: '' } : defaultForm);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitForm = () => {
    let payload = { ...form };
    
    // If editing and password is empty, remove it from payload to preserve existing password
    if (editingId && !form.password) {
      delete payload.password;
    }
    
    const action = editingId ? userService.updateUser(editingId, payload) : userService.register(form);
    action
      .then(() => {
        setSnackbar({ open: true, message: editingId ? 'User updated' : 'User created', severity: 'success' });
        fetchUsers();
        handleCloseForm();
      })
      .catch(() => setSnackbar({ open: true, message: 'Operation failed', severity: 'error' }));
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };

  const handleDelete = () => {
    userService.deleteUser(deleteId, adminUserId)
      .then(() => {
        setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
        fetchUsers();
      })
      .catch(() => setSnackbar({ open: true, message: 'Delete failed', severity: 'error' }))
      .finally(handleCloseDelete);
  };

  // User Role Management (inline change)
  const handleRoleChange = (id, newRole) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    userService.updateUser(id, { ...user, role: newRole })
      .then(() => {
        setSnackbar({ open: true, message: 'Role updated', severity: 'success' });
        fetchUsers();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to update role', severity: 'error' }));
  };

  // Filtering logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <h2>User Management</h2>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>Add User</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search by username or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          size="small"
        />
        <TextField
          select
          label="Role"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="USER">User</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
        </TextField>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Alt Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredUsers) && filteredUsers.map(user => (
                <TableRow
                  key={user.id}
                  sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                >
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.altEmail}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      size="small"
                    >
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <IconButton color="info" onClick={() => setViewUser(user)}>
                      <Visibility />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleOpenForm(user)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDelete(user.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{editingId ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Username" name="username" value={form.username} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label="Email" name="email" value={form.email} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label="Password" name="password" value={form.password} onChange={handleFormChange} type="password" fullWidth />
          <TextField margin="dense" label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label="Alt Email" name="altEmail" value={form.altEmail} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label="Profile Picture URL" name="profilePicture" value={form.profilePicture} onChange={handleFormChange} fullWidth />
          <TextField
            margin="dense"
            label="Role"
            name="role"
            value={form.role}
            onChange={handleFormChange}
            select
            fullWidth
          >
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSubmitForm} variant="contained">{editingId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* User Details View Dialog */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {viewUser && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: 2,
                  mb: 2,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {viewUser.profilePicture ? (
                  <img
                    src={viewUser.profilePicture}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      color: '#aaa',
                      background: '#e0e0e0',
                    }}
                  >
                    {viewUser.username ? viewUser.username[0].toUpperCase() : '?'}
                  </Box>
                )}
              </Box>
              <Box sx={{ width: '100%' }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={2}><b>Username:</b></Grid>
                  <Grid item xs={10}>{viewUser.username}</Grid>
                  <Grid item xs={2}><b>Email:</b></Grid>
                  <Grid item xs={10}>{viewUser.email}</Grid>
                  <Grid item xs={2}><b>Phone:</b></Grid>
                  <Grid item xs={10}>{viewUser.phoneNumber || '-'}</Grid>
                  <Grid item xs={2}><b>Alt Email:</b></Grid>
                  <Grid item xs={10}>{viewUser.altEmail || '-'}</Grid>
                  <Grid item xs={2}><b>Role:</b></Grid>
                  <Grid item xs={10}>{viewUser.role}</Grid>
                  {/* Add more fields as needed */}
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
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

export default AdminUsersPage; 