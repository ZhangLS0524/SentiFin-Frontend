import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FiSend, FiPlus, FiMessageSquare, FiLogOut, FiPaperclip } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/ChatAPI';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadUserChats = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    try {
      console.log('Loading chats for user:', user.id);
      const userChats = await chatService.getChatByUserId(user.id);
      console.log('Received chats:', userChats);
      setChats(userChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }, [user?.id]);

  const loadChatMessages = useCallback(async () => {
    if (!selectedChat) return;
    
    try {
      const chatMessages = await chatService.getChatMessages(selectedChat.id);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [selectedChat]);

  // Handle clipboard paste
  const handlePaste = useCallback(async (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Check file type
          const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            Swal.fire({
              title: 'Invalid image type',
              text: 'Please paste a PNG, JPEG, JPG, or WebP image.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return;
          }

          // Check file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
              title: 'Image too large',
              text: 'Please paste an image smaller than 5MB.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return;
          }

          try {
            const base64 = await convertToBase64(file);
            setAttachment(base64);
            setAttachmentPreview(base64);
          } catch (error) {
            console.error('Error converting pasted image to base64:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to process the pasted image.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
        break;
      }
    }
  }, []);

  // Authentication check effect
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load chats effect
  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    loadUserChats();
  }, [user?.id, loadUserChats]);

  // Message refresh effect
  useEffect(() => {
    let intervalId;
    
    if (selectedChat) {
      // Load messages immediately
      loadChatMessages();
      
      // Set up periodic refresh
      intervalId = setInterval(loadChatMessages, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedChat, loadChatMessages]);

  // Add paste event listener
  useEffect(() => {
    const handleGlobalPaste = (event) => {
      // Only handle paste if we're in a chat and the input is focused
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'INPUT' && selectedChat) {
        handlePaste(event);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handlePaste, selectedChat]);

  console.log('ChatPage rendered, auth state:', { user });

  // If no user, don't render the chat interface
  if (!user) {
    return null;
  }

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    try {
      const chatMessages = await chatService.getChatMessages(chat.id);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleCreateChat = async () => {
    // Step 1: Get chat name and type
    const { value: formValues } = await Swal.fire({
      title: 'Create New Chat',
      html:
        '<input id="chat-name" class="swal2-input" placeholder="Chat Name">' +
        '<select id="chat-type" class="swal2-select">' +
        '<option value="PRIVATE">Private Chat</option>' +
        '<option value="GROUP">Group Chat</option>' +
        '</select>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Next',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          name: document.getElementById('chat-name').value,
          type: document.getElementById('chat-type').value
        }
      }
    });

    if (!formValues) return;

    // Step 2: Fetch users and show user selection
    try {
      const allUsers = await chatService.getAllUsers();
      // Exclude current user
      const selectableUsers = allUsers.filter(u => u.id !== user.id);
      if (selectableUsers.length === 0) {
        Swal.fire({
          title: 'No other users',
          text: 'There are no other users to chat with.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
      // Build options HTML
      const optionsHtml = selectableUsers.map(u => `<option value="${u.id}">${u.username || u.name || u.email || 'User ' + u.id}</option>`).join('');
      let selectHtml = '';
      if (formValues.type === 'PRIVATE') {
        selectHtml = `<select id="chat-users" class="swal2-select">${optionsHtml}</select>`;
      } else {
        selectHtml = `<select id="chat-users" class="swal2-select" multiple size="6">${optionsHtml}</select>`;
      }
      const { value: userSelection } = await Swal.fire({
        title: 'Select Participants',
        html: selectHtml,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Create',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const select = document.getElementById('chat-users');
          if (!select) return null;
          if (formValues.type === 'PRIVATE') {
            return select.value ? [select.value] : [];
          } else {
            return Array.from(select.selectedOptions).map(opt => opt.value);
          }
        }
      });
      if (!userSelection || userSelection.length === 0) {
        Swal.fire({
          title: 'No users selected',
          text: 'Please select at least one user to start the chat.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
      // Step 3: Create chat and add participants
      try {
        const chatResponse = await chatService.createChat({
          chatName: formValues.name,
          chatType: formValues.type,
        });
        // Add the creator as a participant
        await chatService.addParticipants(chatResponse.id, [user.id]);
        // Add selected users as participants
        await chatService.addParticipants(chatResponse.id, userSelection);
        // Refresh the chat list
        await loadUserChats();
        Swal.fire({
          title: 'Chat Created!',
          text: `Successfully created ${formValues.name}`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to create chat',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to load users',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !attachment) || !selectedChat) return;

    try {
      // Disable the input and button while sending
      const inputElement = e.target.querySelector('input');
      const buttonElement = e.target.querySelector('button');
      if (inputElement) inputElement.disabled = true;
      if (buttonElement) buttonElement.disabled = true;

      const sentMessage = await chatService.sendMessage(
        selectedChat.id,
        message || '',
        user.id,
        attachment
      );
      
      // Add the new message to the messages array
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setMessage('');
      setAttachment(null);
      setAttachmentPreview(null);
      // Reset file input after successful send
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Scroll to the bottom of the chat
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to send message. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      // Re-enable the input and button
      const inputElement = e.target.querySelector('input');
      const buttonElement = e.target.querySelector('button');
      if (inputElement) inputElement.disabled = false;
      if (buttonElement) buttonElement.disabled = false;
    }
  };

  // Exit group logic
  const handleExitGroup = async () => {
    if (!selectedChat || selectedChat.chatType !== 'GROUP') return;
    setIsExiting(true);
    try {
      const confirm = await Swal.fire({
        title: 'Exit Group',
        text: 'Are you sure you want to exit this group?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, exit',
        cancelButtonText: 'Cancel',
      });
      if (!confirm.isConfirmed) {
        setIsExiting(false);
        return;
      }
      // Get all participants for this chat
      const participants = await chatService.getParticipantsByChatId(selectedChat.id);
      const myParticipant = participants.find(p => p.user && p.user.id === user.id);
      if (!myParticipant) {
        Swal.fire({
          title: 'Not a participant',
          text: 'You are not a participant in this group.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        setIsExiting(false);
        return;
      }
      // Remove self from group
      await chatService.deleteParticipant(myParticipant.id);
      Swal.fire({
        title: 'Exited Group',
        text: 'You have exited the group.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      // Refresh chat list and clear selected chat
      await loadUserChats();
      setSelectedChat(null);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to exit group',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsExiting(false);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: 'Invalid file type',
        text: 'Please select a PNG, JPEG, JPG, or WebP image.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'File too large',
        text: 'Please select an image smaller than 5MB.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setAttachment(base64);
      setAttachmentPreview(base64);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to process the image.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove attachment
  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show full image
  const showFullImage = (imageSrc) => {
    // Check if it's an image
    if (imageSrc.startsWith('data:image')) {
      Swal.fire({
        title: 'Image',
        imageUrl: imageSrc,
        imageWidth: '100%',
        imageHeight: 'auto',
        imageAlt: 'Full size image',
        confirmButtonText: 'Close'
      });
    } else {
      // For non-image files, trigger download
      const link = document.createElement('a');
      link.href = imageSrc;
      
      // Extract filename from base64 or use default
      let filename = 'attachment';
      if (imageSrc.includes('pdf')) {
        filename = 'document.pdf';
      } else if (imageSrc.includes('doc')) {
        filename = 'document.doc';
      } else if (imageSrc.includes('docx')) {
        filename = 'document.docx';
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="chatpage">
      <div className="content-wrapper" style={{ margin: '0',  padding: '0'}}>
        <div className="chatpage-flex">
          <div className="chat-sidebar">
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Chats</h5>
                <Button 
                  variant="light" 
                  size="sm" 
                  className="rounded-circle p-1"
                  onClick={handleCreateChat}
                  title="Create New Chat"
                >
                  <FiPlus size={20} />
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  {chats && chats.length > 0 ? (
                    chats.map(chat => (
                      <div 
                        key={chat.id} 
                        className={`list-group-item d-flex align-items-center ${selectedChat?.id === chat.id ? 'active' : ''}`}
                        onClick={() => handleChatSelect(chat)}
                        style={{ cursor: 'pointer' }}
                      >
                        <FiMessageSquare className="me-2" />
                        <div className="d-flex flex-column">
                          <span>{chat.chatName}</span>
                          <small className="text-muted">
                            {chat.chatType === 'PRIVATE' ? 'Private Chat' : 'Group Chat'}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="list-group-item text-center text-muted">
                      No chats available
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
          <div className="chat-main">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  {selectedChat ? selectedChat.chatName : 'Select a chat to start messaging'}
                  {/* Exit Group button for group chats */}
                  {selectedChat && selectedChat.chatType === 'GROUP' && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="float-end ms-2"
                      onClick={handleExitGroup}
                      disabled={isExiting}
                      title="Exit Group"
                    >
                      <FiLogOut /> Exit Group
                    </Button>
                  )}
                </h5>
              </Card.Header>
              <Card.Body className="chat-messages" style={{ height: '60vh', overflowY: 'auto' }}>
                {selectedChat ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`d-flex mb-3 ${msg.sender && user && msg.sender.id === user.id ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        className={`message-bubble ${
                          msg.sender && user && msg.sender.id === user.id ? 'bg-primary text-white' : 'bg-light'
                        } p-3 rounded`}
                        style={{ maxWidth: '70%' }}
                      >
                        <div className="d-flex align-items-center mb-1">
                          <small className={`${msg.sender && user && msg.sender.id === user.id ? 'text-white-50' : 'text-muted'}`}>
                            {msg.sender ? (msg.sender.username || msg.sender.name || 'Unknown User') : 'Unknown User'} • {
                              msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              }) : 'Invalid time'
                            }
                          </small>
                        </div>
                        <div>{msg.content}</div>
                        {msg.attachment && msg.attachment.startsWith('data:image') && (
                          <div className="mt-2">
                            <img
                              src={msg.attachment}
                              alt="Attachment"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                cursor: 'pointer',
                                borderRadius: '8px'
                              }}
                              onClick={() => showFullImage(msg.attachment)}
                              title="Click to view full size"
                            />
                          </div>
                        )}
                        {msg.attachment && !msg.attachment.startsWith('data:image') && (
                          <div className="mt-2">
                            <a 
                              href={msg.attachment} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`${msg.sender && user && msg.sender.id === user.id ? 'text-white' : 'text-primary'}`}
                            >
                              View Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted mt-5">
                    <FiMessageSquare size={48} />
                    <p className="mt-3">Select a chat to view messages</p>
                  </div>
                )}
              </Card.Body>
              {selectedChat && (
                <Card.Footer>
                  {/* Attachment Preview */}
                  {attachmentPreview && (
                    <div className="mb-3 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-muted small">Image attached:</span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={removeAttachment}
                        >
                          Remove
                        </Button>
                      </div>
                      <img
                        src={attachmentPreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100px',
                          maxHeight: '100px',
                          marginTop: '8px',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <InputGroup>
                      <InputGroup.Text>
                        <label htmlFor="file-upload" style={{ cursor: 'pointer', margin: 0 }}>
                          <FiPaperclip size={16} />
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                        />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button variant="primary" type="submit">
                        <FiSend />
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 