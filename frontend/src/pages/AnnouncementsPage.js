import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { AnnouncementAPI } from '../services/AnnouncementAPI';
import Swal from 'sweetalert2';
import '../styles/Announcements.css';

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            <Container className="py-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (announcements.length === 0) {
        return (
            <Container className="py-4">
                <Alert variant="info">No announcements available.</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Announcements</h2>
            <Row>
                {announcements.map((announcement) => (
                    <Col key={announcement.id} md={6} lg={4} className="mb-4">
                        <Card className="announcement-card h-100">
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
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default AnnouncementsPage; 