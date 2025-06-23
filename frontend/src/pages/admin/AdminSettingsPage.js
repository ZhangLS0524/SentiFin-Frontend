import React, { useState, useEffect } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    apiEnabled: true,
    predictionModelEnabled: true,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    // TODO: Fetch current settings from backend
    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch settings
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      // setSettings(data);
    } catch (error) {
      setError('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (setting) => {
    try {
      setLoading(true);
      const newSettings = { ...settings, [setting]: !settings[setting] };
      
      // TODO: Implement API call to update settings
      // await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // });

      setSettings(newSettings);
      Swal.fire({
        icon: 'success',
        title: 'Settings Updated',
        text: 'The system settings have been updated successfully.',
      });
    } catch (error) {
      setError('Failed to update settings');
      console.error('Error updating settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update settings. Please try again.',
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
      <h2 className="mb-4">System Settings</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">API & Prediction Model Settings</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="api-enabled"
                label="Enable API Access"
                checked={settings.apiEnabled}
                onChange={() => handleToggle('apiEnabled')}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                When disabled, all API endpoints will return a maintenance message.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="prediction-enabled"
                label="Enable Prediction Models"
                checked={settings.predictionModelEnabled}
                onChange={() => handleToggle('predictionModelEnabled')}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                When disabled, all prediction features will be unavailable.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="maintenance-mode"
                label="Maintenance Mode"
                checked={settings.maintenanceMode}
                onChange={() => handleToggle('maintenanceMode')}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                When enabled, the system will be in maintenance mode and only administrators can access it.
              </Form.Text>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSettingsPage; 