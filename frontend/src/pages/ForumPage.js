import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { ForumAPI } from '../services/ForumAPI';
import '../styles/ForumPage.css';

const ForumPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ForumAPI.getAllForums();
      if (!data || !Array.isArray(data)) {
        setError('Invalid data received from server');
        return;
      }
      setForums(data);
    } catch (error) {
      console.error('Error in loadForums:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load forum posts';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to create a forum post',
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Create New Forum Post',
      html:
        '<input id="title" class="swal2-input" placeholder="Title">' +
        '<textarea id="description" class="swal2-textarea" placeholder="Description (max 100 characters)" maxlength="100"></textarea>' +
        '<input type="file" id="attachment" class="swal2-file" accept="image/*,.pdf,.doc,.docx">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create Post',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const attachment = document.getElementById('attachment').files[0];
        
        if (!title || !description) {
          Swal.showValidationMessage('Please fill in all required fields');
          return false;
        }

        if (description.length > 100) {
          Swal.showValidationMessage('Description must be 100 characters or less');
          return false;
        }
        
        return {
          title: title,
          description: description,
          attachment: attachment ? attachment.name : null,
          author: Number(user.id)
        };
      }
    });

    if (formValues) {
      try {
        console.log('Creating new forum post:', formValues);
        await ForumAPI.createForum(formValues);
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your forum post has been created.',
          confirmButtonText: 'OK'
        });

        loadForums();
      } catch (error) {
        console.error('Error creating forum:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong while creating your post.';
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleForumClick = (forumId) => {
    navigate(`/community/${forumId}`);
  };

  if (error) {
    return (
      <div className="forumpage-full-wrapper">
        <div className="content-wrapper">
          <div className="forum-header">
            <h1>Discussion Forum</h1>
          </div>
          <div className="forum-content">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadForums}>Try Again</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forumpage-full-wrapper">
      <div className="content-wrapper">
        <div className="forum-header">
          <h1>Discussion Forum</h1>
          <button className="create-forum-btn" onClick={handleCreateForum}>
            Create New Forum
          </button>
        </div>
        <div className="forum-content">
          {loading ? (
            <div className="forum-list">
              <div className="loading-spinner"></div>
              <p>Loading forum posts...</p>
            </div>
          ) : forums.length === 0 ? (
            <div className="forum-list">
              <p>No forum posts yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="forum-list">
              {forums.map((forum) => (
                <div 
                  key={forum.id} 
                  className="forum-item"
                  onClick={() => handleForumClick(forum.id)}
                >
                  <div className="forum-item-header">
                    <h3>{forum.title}</h3>
                    <span className="forum-date">
                      {new Date(forum.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="forum-description">{forum.description}</p>
                  <div className="forum-item-footer">
                    <span className="forum-author">
                      Posted by: {forum.author?.username || 'Anonymous'}
                    </span>
                    {forum.attachment && (
                      <div className="forum-attachment">
                        <span className="attachment-icon">📎</span>
                        <span>Has attachment</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPage; 