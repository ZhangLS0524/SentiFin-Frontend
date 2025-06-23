import React, { useState, useEffect } from 'react';
import {Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnnouncementAPI } from '../../services/AnnouncementAPI';
import Swal from 'sweetalert2';
import { IconButton, Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const AdminAnnouncementsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachmentUrl: '',
    userId: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadAnnouncements();
  }, [user, navigate]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await AnnouncementAPI.getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      setError('Failed to load announcements');
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (announcement = null) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        description: announcement.description,
        attachmentUrl: announcement.attachmentUrl || '',
        userId: user.id
      });
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        title: '',
        description: '',
        attachmentUrl: '',
        userId: user.id
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      description: '',
      attachmentUrl: '',
      userId: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedAnnouncement) {
        await AnnouncementAPI.updateAnnouncement(selectedAnnouncement.id, formData);
      } else {
        await AnnouncementAPI.createAnnouncement(formData);
      }

      await loadAnnouncements();
      handleCloseModal();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Announcement ${selectedAnnouncement ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      setError(`Failed to ${selectedAnnouncement ? 'update' : 'create'} announcement`);
      console.error('Error saving announcement:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${selectedAnnouncement ? 'update' : 'create'} announcement. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'No, cancel'
      });

      if (result.isConfirmed) {
        setLoading(true);
        await AnnouncementAPI.deleteAnnouncement(id, user.id);
        await loadAnnouncements();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The announcement has been deleted.',
        });
      }
    } catch (error) {
      setError('Failed to delete announcement');
      console.error('Error deleting announcement:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete announcement. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Announcements</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Create New Announcement
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <TableContainer component={Paper}>
        <MuiTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Attachment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                <TableCell>{announcement.title}</TableCell>
                <TableCell>{announcement.description}</TableCell>
                <TableCell>
                  {announcement.attachmentUrl ? (
                    <a 
                      href={announcement.attachmentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Attachment
                    </a>
                  ) : (
                    'No attachment'
                  )}
                </TableCell>
                <TableCell>{new Date(announcement.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                    <IconButton color="primary" onClick={() => handleShowModal(announcement)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(announcement.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Attachment URL (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/attachment.pdf"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : selectedAnnouncement ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminAnnouncementsPage; 