import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './components/Dashboard';
import { DashboardPage } from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import GuestsPage from './pages/GuestsPage';
import VendorsPage from './pages/VendorsPage';
import MainLayout from './components/layout/MainLayout';
import UsersPage from './pages/UsersPage';
import { UserRole } from '@attendandt/shared';
import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Routes with MainLayout */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route 
                  path="guests" 
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN, UserRole.STAFF]}>
                      <GuestsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="vendors" 
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN, UserRole.STAFF]}>
                      <VendorsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="users" 
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN]}>
                      <UsersPage />
                    </ProtectedRoute>
                  } 
                />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App; 