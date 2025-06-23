import React, { useState } from 'react';
import { Form, Button, Card, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [altEmail, setAltEmail] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        username: username,
        email: email,
        password: password,
        phoneNumber: phone || null,
        altEmail: altEmail || null,
        profilePicture: profilePic ? await convertToBase64(profilePic) : null
      };

      await userService.register(userData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (altEmail && !emailRegex.test(altEmail)) {
      setError('Please enter a valid alternate email address.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const convertToBase64 = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light position-relative">
      <Button
        variant="outline-secondary"
        size="sm"
        className="position-absolute"
        style={{ top: 32, right: 32, zIndex: 10 }}
        onClick={() => navigate('/')}
      >
        Back to Main Page
      </Button>
      <Card style={{ minWidth: 350, maxWidth: 420 }} className="shadow p-4 w-100">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0 text-center flex-grow-1">Register</h3>
        </div>
        <hr className="mb-4 mt-2" />
        <Form onSubmit={handleSubmit}>
          <div className="d-flex flex-column align-items-center mb-4">
            <Image
              src={profilePic || 'data:image/jpeg;base64,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'}
              roundedCircle
              width={80}
              height={80}
              alt="Profile"
              className="mb-2 shadow-sm border"
              style={{ objectFit: 'cover', background: '#f8f9fa' }}
            />
            <Form.Label className="btn btn-outline-secondary btn-sm mb-0 mt-2">
              Upload Picture
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                style={{ display: 'none' }}
              />
            </Form.Label>
          </div>

          <h5 className="mb-3 mt-4">Account Information</h5>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              isInvalid={!!error && (!emailRegex.test(email) || !email)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <h5 className="mb-3 mt-4">Optional Details</h5>
          <Form.Group className="mb-3" controlId="formPhone">
            <Form.Label>Phone Number <span className="text-muted">(optional)</span></Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAltEmail">
            <Form.Label>Alternate Email <span className="text-muted">(optional)</span></Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter alternate email"
              value={altEmail}
              onChange={(e) => setAltEmail(e.target.value)}
              isInvalid={!!error && altEmail && !emailRegex.test(altEmail)}
            />
          </Form.Group>

          {error && <div className="text-danger mb-3">{error}</div>}
          {success && <div className="text-success mb-3">{success}</div>}

          <Button variant="primary" type="submit" className="w-100 mb-2 mt-3">
            Register
          </Button>
        </Form>
        <div className="text-center mt-3">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage; 