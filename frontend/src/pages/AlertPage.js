import React, { useEffect, useState, useCallback } from 'react';
import { Button, Table, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { AlertAPI } from '../services/AlertAPI';
import { TickerAPI } from '../services/TickerAPI';
import { useNavigate } from 'react-router-dom';
import '../styles/AlertPage.css';

const AlertPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await AlertAPI.getAlertsByUserId(user.id);
      setAlerts(data);
    } catch (err) {
      setError('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user, fetchAlerts]);

  // Validate ticker symbol using TickerAPI
  const validateTicker = async (ticker) => {
    try {
      await TickerAPI.getTickerBySymbol(ticker);
      return true;
    } catch {
      return false;
    }
  };

  // Show SweetAlert2 popup for create/edit
  const showAlertPopup = async (mode, initial = {}) => {
    let isSubmitting = false;
    return Swal.fire({
      title: mode === 'edit' ? 'Edit Alert' : 'Create Alert',
      html:
        `<input id="swal-ticker" class="swal2-input" placeholder="Ticker Symbol" value="${initial.ticker || ''}">` +
        `<input id="swal-price" type="number" class="swal2-input" placeholder="Price" value="${initial.limitPrice || ''}">` +
        `<select id="swal-direction" class="swal2-input">` +
          `<option value="UP" ${initial.direction === 'UP' ? 'selected' : ''}>Up</option>` +
          `<option value="DOWN" ${initial.direction === 'DOWN' ? 'selected' : ''}>Down</option>` +
        `</select>` +
        (mode === 'edit' ? `<div style='margin-top:8px;font-size:0.95em;'>Notified: <span style='font-weight:600;color:${initial.isNotified ? '#22c55e' : '#64748b'}'>${initial.isNotified ? 'Yes' : 'No'}</span></div>` : ''),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: mode === 'edit' ? 'Update' : 'Create',
      preConfirm: async () => {
        if (isSubmitting) return false;
        const ticker = document.getElementById('swal-ticker').value.trim().toUpperCase();
        const price = parseFloat(document.getElementById('swal-price').value);
        const direction = document.getElementById('swal-direction').value;
        if (!ticker || isNaN(price) || !direction) {
          Swal.showValidationMessage('Please fill all fields correctly.');
          return false;
        }
        Swal.showLoading();
        isSubmitting = true;
        const valid = await validateTicker(ticker);
        Swal.hideLoading();
        isSubmitting = false;
        if (!valid) {
          Swal.showValidationMessage('Invalid ticker symbol.');
          return false;
        }
        return { ticker, limitPrice: price, direction };
      }
    });
  };

  // Create alert handler
  const handleCreateAlert = async () => {
    const { value: formValues, isConfirmed } = await showAlertPopup('create');
    if (formValues && isConfirmed) {
      try {
        setLoading(true);
        await AlertAPI.createAlert({
          ticker: formValues.ticker,
          limitPrice: formValues.limitPrice,
          direction: formValues.direction,
          userId: user.id,
          isNotified: false
        });
        Swal.fire('Success', 'Alert created!', 'success');
        fetchAlerts();
      } catch (err) {
        Swal.fire('Error', 'Failed to create alert.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit alert handler
  const handleEditAlert = async (alert) => {
    const { value: formValues, isConfirmed } = await showAlertPopup('edit', alert);
    if (formValues && isConfirmed) {
      try {
        setLoading(true);
        await AlertAPI.updateAlert(alert.id, {
          ...alert,
          ticker: formValues.ticker,
          limitPrice: formValues.limitPrice,
          direction: formValues.direction,
          userId: user.id,
          isNotified: alert.isNotified
        });
        Swal.fire('Success', 'Alert updated!', 'success');
        fetchAlerts();
      } catch (err) {
        Swal.fire('Error', 'Failed to update alert.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete alert handler
  const handleDeleteAlert = async (alert) => {
    const result = await Swal.fire({
      title: 'Delete Alert',
      text: `Are you sure you want to delete the alert for ${alert.ticker}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await AlertAPI.deleteAlert(alert.id);
        Swal.fire('Deleted!', 'Alert has been deleted.', 'success');
        fetchAlerts();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete alert.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle ticker click to navigate to dashboard with ticker param
  const handleTickerClick = (ticker) => {
    navigate(`/dashboard?ticker=${encodeURIComponent(ticker)}`);
  };

  // Reset alert handler
  const handleResetAlert = async (alert) => {
    try {
      setLoading(true);
      await AlertAPI.resetAlert(alert.id);
      Swal.fire('Success', 'Alert reactivated!', 'success');
      fetchAlerts();
    } catch (err) {
      Swal.fire('Error', 'Failed to reactivate alert.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alert-page-container container py-4">
      <div className="alert-page-header d-flex justify-content-between align-items-center mb-3">
        <h2>My Alerts</h2>
        <Button variant="primary" onClick={handleCreateAlert}>
          Create Alert
        </Button>
      </div>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table className="alerts-table" striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Ticker</th>
              <th>Price</th>
              <th>Direction</th>
              <th>Notified</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No alerts found.</td>
              </tr>
            ) : (
              alerts.map((alert, idx) => (
                <tr key={alert.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <span
                      className="alert-ticker-link"
                      style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => handleTickerClick(alert.ticker)}
                    >
                      {alert.ticker}
                    </span>
                  </td>
                  <td>{alert.limitPrice}</td>
                  <td>{alert.direction}</td>
                  <td>
                    {alert.isNotified
                      ? <span className="badge bg-success">Yes</span>
                      : <span className="badge bg-secondary">No</span>
                    }
                  </td>
                  <td>{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-'}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEditAlert(alert)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDeleteAlert(alert)}>
                      Delete
                    </Button>
                    {alert.isNotified && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        className="me-2"
                        onClick={() => handleResetAlert(alert)}
                      >
                        Reactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default AlertPage; 