import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachment: null,
    userId: null
  });
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

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
        attachment: announcement.attachment || null,
        userId: user.id
      });
      setAttachmentPreview(announcement.attachment || null);
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        title: '',
        description: '',
        attachment: null,
        userId: user.id
      });
      setAttachmentPreview(null);
      // Reset file input for new announcement
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileInputKey(prevKey => prevKey + 1);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      description: '',
      attachment: null,
      userId: null
    });
    setAttachmentPreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileInputKey(prevKey => prevKey + 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: 'Invalid file type',
        text: 'Please select a valid file type (Images, PDF, DOC, DOCX)',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'File too large',
        text: 'Please select a file smaller than 5MB.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setFormData(prev => ({ ...prev, attachment: base64 }));
      setAttachmentPreview(base64);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to process the file.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  // Remove attachment
  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
    setAttachmentPreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileInputKey(prevKey => prevKey + 1);
  };

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
        imageAlt: 'Announcement attachment',
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
                  {announcement.attachment ? (
                    <IconButton color="primary" onClick={() => handleAttachmentClick(announcement.attachment)}>
                      {getAttachmentIcon(announcement.attachment)}
                    </IconButton>
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
              <Form.Label>Attachment</Form.Label>
              <Form.Control
                type="file"
                ref={fileInputRef}
                key={fileInputKey}
                onChange={handleFileUpload}
              />
            </Form.Group>

            {attachmentPreview && (
              <div className="mb-3">
                <img
                  src={attachmentPreview}
                  alt="Attachment Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
                <Button variant="secondary" onClick={removeAttachment}>
                  Remove Attachment
                </Button>
              </div>
            )}
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