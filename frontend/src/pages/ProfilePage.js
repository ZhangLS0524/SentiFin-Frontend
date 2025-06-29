import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, Image, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    altEmail: '',
    profilePicture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        altEmail: user.altEmail || '',
        profilePicture: user.profilePicture || null
      });
      setPreviewImage(user.profilePicture);
    }
  }, [user]);

  const handleProfilePicChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PNG, JPEG, JPG, or WebP image.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Please select an image smaller than 5MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setPreviewImage(base64);
        setFormData(prev => ({ ...prev, profilePicture: base64 }));
        setError('');
      } catch (err) {
        setError('Failed to process the image.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removeProfilePicture = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, profilePicture: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Only send fields that are present and not null, and omit password
      const payload = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        altEmail: formData.altEmail,
        profilePicture: formData.profilePicture
      };
      await userService.updateUser(user.id, payload);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">Profile Settings</h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="d-flex flex-column align-items-center mb-4">
              <Image
                src={previewImage || 'data:image/jpeg;base64,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'}
                roundedCircle
                width={120}
                height={120}
                alt="Profile"
                className="mb-2 shadow-sm border"
                style={{ objectFit: 'cover', background: '#f8f9fa' }}
              />
              <Form.Label className="btn btn-outline-secondary btn-sm mb-0 mt-2">
                Change Picture
                <Form.Control
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleProfilePicChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
              </Form.Label>
              {previewImage && (
                <Button variant="outline-danger" size="sm" className="mt-2" onClick={removeProfilePicture}>
                  Remove
                </Button>
              )}
            </div>

            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPhone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAltEmail">
              <Form.Label>Alternate Email</Form.Label>
              <Form.Control
                type="email"
                name="altEmail"
                value={formData.altEmail}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfilePage; 