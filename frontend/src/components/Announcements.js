import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button } from 'react-bootstrap';
import { AnnouncementAPI } from '../services/AnnouncementAPI';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
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
        navigate(user?.role === 'ADMIN' ? '/admin/announcements' : '/api/announcements');
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
                            {announcement.attachment && (
                                <div className="mt-2">
                                    <button 
                                        className="btn btn-link p-0 attachment-link"
                                        onClick={() => handleAttachmentClick(announcement.attachment)}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        {getAttachmentIcon(announcement.attachment)} View Attachment
                                    </button>
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