import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { ForumAPI } from '../services/ForumAPI';
import '../styles/ForumDetailPage.css';

const ForumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forum, setForum] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForumDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const forumData = await ForumAPI.getForumById(id);
      setForum(forumData);
      const commentsData = await ForumAPI.getForumComments(id);
      setComments(commentsData);
    } catch (error) {
      setError('Failed to load forum details. Please try again later.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load forum details',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadForumDetails();
  }, [loadForumDetails]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        content: newComment,
        forumId: Number(id),
        author: Number(user.id)
      };

      await ForumAPI.postComment(commentData);
      setNewComment('');
      loadForumDetails(); // Reload to get updated comments
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your comment has been posted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to post comment',
      });
    }
  };

  const handleDeleteForum = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await ForumAPI.deleteForum(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your forum post has been deleted.',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/community');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete forum post',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="forumdetail-full-wrapper">
        <div className="content-wrapper">
          <div className="loading-spinner"></div>
          <p>Loading forum details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forumdetail-full-wrapper">
        <div className="content-wrapper">
          <p>{error}</p>
          <button onClick={() => navigate('/community')}>Return to Forums</button>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="forumdetail-full-wrapper">
        <div className="content-wrapper">
          <p>Forum post not found</p>
          <button onClick={() => navigate('/community')}>Return to Forums</button>
        </div>
      </div>
    );
  }

  const isAuthor = user && forum.author?.id === user.id;

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
        imageAlt: 'Forum attachment',
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

  return (
    <div className="forumdetail-full-wrapper">
      <div className="content-wrapper">
        <button className="back-button" onClick={() => navigate('/community')}>
          ← Back to Forums
        </button>
        
        <div className="forum-detail-content">
          <div className="forum-post">
            <div className="forum-post-header">
              <h1>{forum.title}</h1>
              {isAuthor && (
                <div className="forum-actions">
                  <button 
                    className="delete-button"
                    onClick={handleDeleteForum}
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
            <div className="forum-meta">
              <span className="author">
                Posted by: {forum.author.username || 'Anonymous'}
              </span>
              <span className="date">
                {new Date(forum.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="forum-description">{forum.description}</p>
            {forum.attachment && (
              <div 
                className="forum-attachment"
                onClick={() => handleAttachmentClick(forum.attachment)}
                style={{ cursor: 'pointer' }}
              >
                <span className="attachment-icon">{getAttachmentIcon(forum.attachment)}</span>
                <span>View attachment</span>
              </div>
            )}
          </div>

          <div className="comments-section">
            <h2>Comments ({comments.length})</h2>
            
            {user ? (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment..."
                  maxLength={500}
                  required
                />
                <button type="submit">Post Comment</button>
              </form>
            ) : (
              <div className="login-prompt">
                Please <button onClick={() => navigate('/login')}>login</button> to post comments
              </div>
            )}

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.author.username || 'Anonymous'}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumDetailPage; 