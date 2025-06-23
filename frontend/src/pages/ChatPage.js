import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FiSend, FiPlus, FiMessageSquare } from 'react-icons/fi';
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

    if (formValues) {
      try {
        // Create the chat
        const chatResponse = await chatService.createChat({
          chatName: formValues.name,
          chatType: formValues.type,
        });

        // Add the creator as a participant
        await chatService.addParticipants(chatResponse.id, [user.id]);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      // Disable the input and button while sending
      const inputElement = e.target.querySelector('input');
      const buttonElement = e.target.querySelector('button');
      if (inputElement) inputElement.disabled = true;
      if (buttonElement) buttonElement.disabled = true;

      const sentMessage = await chatService.sendMessage(
        selectedChat.id,
        message,
        user.id
      );
      
      // Add the new message to the messages array
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setMessage('');

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

  return (
    <div className="chatpage-full-wrapper py-4">
      <div className="content-wrapper">
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
                        {msg.attachment && (
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
                  <Form onSubmit={handleSubmit}>
                    <InputGroup>
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