import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import StockPage from '../pages/StockPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import ChatPage from '../pages/ChatPage';
import ForumPage from '../pages/ForumPage';
import ForumDetailPage from '../pages/ForumDetailPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminAnnouncementsPage from '../pages/admin/AdminAnnouncementsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminForumsPage from '../pages/admin/AdminForumsPage'; 
import Layout from '../components/Layout';
import { AuthProvider, useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import DashboardPage from '../pages/DashboardPage';
import WatchlistPage from '../pages/WatchlistPage';
import ApiDocumentationPage from '../pages/apiDocumentationPage';
import AlertPage from '../pages/AlertPage';
import AdminChatPage from '../pages/admin/AdminChatPage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stock/:ticker" element={<StockPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/community" element={<ForumPage />} />
            <Route path="/community/:id" element={<ForumDetailPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/alert" element={<AlertPage />} />
            <Route path="/admin/forums" element={<AdminForumsPage />} />
            <Route 
              path="/announcements" 
              element={
                <ProtectedRoute>
                  <AnnouncementsPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/api" element={<ApiDocumentationPage />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminSettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/announcements" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminAnnouncementsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminUsersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/chatrooms" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminChatPage />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
