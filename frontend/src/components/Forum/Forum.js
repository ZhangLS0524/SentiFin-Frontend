import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Forum.css';

const Forum = () => {
  const navigate = useNavigate();

  const handleCreateForum = () => {
    // TODO: Implement create forum functionality
    console.log('Create forum clicked');
  };

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Discussion Forum</h1>
        <button className="create-forum-btn" onClick={handleCreateForum}>
          Create New Forum
        </button>
      </div>
      <div className="forum-content">
        <div className="forum-list">
          <p>No forum posts yet. Be the first to create one!</p>
        </div>
      </div>
    </div>
  );
};

export default Forum; 