import React, { useState } from 'react';
import { Nav, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import logo from '../assets/images/sentifin-logo.png';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiStar, 
  FiBell, 
  FiMessageSquare, 
  FiUsers, 
  FiBook, 
  FiChevronLeft, 
  FiChevronRight, 
  FiUser,
  FiLogOut,
  FiSettings,
  FiUserPlus,
  FiMessageCircle,
  FiAlertCircle
} from 'react-icons/fi';

const Sidebar = ({ onToggle }) => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseNavItems = [
    { path: '/', icon: <FiHome size={20} />, label: ' Dashboard' },
    { path: '/watchlist', icon: <FiStar size={20} />, label: ' Watchlist' },
    { path: '/alert', icon: <FiBell size={20} />, label: ' Alert' },
    { 
      path: user?.role === 'ADMIN' ? '/admin/announcements' : '/announcements', 
      icon: <FiAlertCircle size={20} />, 
      label: '  Announcements' 
    },
    { path: '/chat', icon: <FiMessageSquare size={20} />, label: ' Chat Room' },
    { path: '/community', icon: <FiUsers size={20} />, label: ' Community' },
    { path: '/api', icon: <FiBook size={20} />, label: ' API Documentation' },
  ];

  const adminNavItems = [
    { path: '/admin/announcements', icon: <FiAlertCircle size={20} />, label: ' Manage Announcements' },
    { path: '/admin/users', icon: <FiUserPlus size={20} />, label: ' Manage Users' },
    { path: '/admin/forums', icon: <FiMessageCircle size={20} />, label: ' Manage Forum' },
    { path: '/admin/chatrooms', icon: <FiMessageSquare size={20} />, label: ' Manage Chat Room' },
    { path: '/admin/settings', icon: <FiSettings size={20} />, label: ' System Settings' },
  ];

  const navItems = user?.role === 'ADMIN'
    ? [...baseNavItems, ...adminNavItems].filter(
        (item, index, self) => index === self.findIndex(i => i.path === item.path)
      )
    : baseNavItems;

  return (
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          {expanded && <span className="brand-name">SentiFin</span>}
        </div>
        <Button 
          variant="link" 
          className="toggle-btn" 
          onClick={toggleSidebar}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </Button>
      </div>
      <Nav className="sidebar-nav">
        {navItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={!expanded ? item.label : ''}
          >
            {item.icon}
            {expanded && <span className="nav-label">{item.label}</span>}
          </Nav.Link>
        ))}
      </Nav>
      <div className="sidebar-login-btn-container">
        {user ? (
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="primary"
              className="sidebar-login-btn"
              id="user-dropdown"
            >
              <FiUser size={20} />
              {expanded && <span className="login-label">{user.username}</span>}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/profile">
                <FiUser className="me-2" /> Profile
              </Dropdown.Item>
              {user.role === 'ADMIN' && (
                <Dropdown.Item as={Link} to="/admin/settings">
                  <FiSettings className="me-2" /> Admin Settings
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <FiLogOut className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Button
            as={Link}
            to="/login"
            variant="primary"
            className="sidebar-login-btn"
            title="Login"
          >
            <FiUser size={20} />
            {expanded && <span className="login-label">Login</span>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 