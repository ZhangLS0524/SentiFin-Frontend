import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button } from 'react-bootstrap';
import { AnnouncementAPI } from '../services/AnnouncementAPI';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Announcements.css';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadAnnouncements();
    }, []);

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

    const handleViewMore = () => {
        navigate(user?.role === 'ADMIN' ? '/admin/announcements' : '/announcements');
    };

    if (loading) {
        return (
            <div className="announcements-container">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="announcements-container">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="announcements-container">
                <Alert variant="info">No announcements available.</Alert>
            </div>
        );
    }

    const displayAnnouncements = announcements.slice(0, 5);
    const hasMoreAnnouncements = announcements.length > 3;

    return (
        <div className="announcements-container">
            <h3 className="mb-4">Announcements</h3>
            <div className={`announcements-grid ${hasMoreAnnouncements ? 'scrollable' : ''}`}>
                {displayAnnouncements.map((announcement) => (
                    <Card key={announcement.id} className="announcement-card">
                        <Card.Body>
                            <Card.Title>{announcement.title}</Card.Title>
                            <Card.Text>{announcement.description}</Card.Text>
                            {announcement.attachmentUrl && (
                                <div className="mt-2">
                                    <a 
                                        href={announcement.attachmentUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="attachment-link"
                                    >
                                        View Attachment
                                    </a>
                                </div>
                            )}
                            <div className="announcement-meta">
                                <small className="text-muted">
                                    Posted by {announcement.user?.username || 'Admin'} on{' '}
                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                    {announcement.edited && ' (Edited)'}
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>
            {announcements.length > 5 && (
                <div className="text-center mt-3">
                    <Button variant="outline-primary" onClick={handleViewMore}>
                        View More Announcements
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Announcements; 