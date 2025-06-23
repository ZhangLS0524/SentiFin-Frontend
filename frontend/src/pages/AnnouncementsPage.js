import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { AnnouncementAPI } from '../services/AnnouncementAPI';
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
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default AnnouncementsPage; 