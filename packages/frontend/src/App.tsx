import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { UserRole } from '@attendandt/shared';
import { ToastProvider } from './context/ToastContext';
import { DashboardSkeleton, ProfileSkeleton, ListSkeleton, AuthSkeleton } from './components/skeletons';

// Lazy load components for code splitting
const LoginForm = React.lazy(() => import('./components/auth/LoginForm'));
const RegisterForm = React.lazy(() => import('./components/auth/RegisterForm'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const GuestsPage = React.lazy(() => import('./pages/GuestsPage'));
const VendorsPage = React.lazy(() => import('./pages/VendorsPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="text-gray-600">Loading...</span>
    </div>
  </div>
);

// Enhanced React Query configuration for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - data stays in cache for 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      // Keep previous data while fetching new data for better UX
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      retry: 1,
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
              {/* Auth routes with lazy loading */}
              <Route path="/login" element={
                <Suspense fallback={<AuthSkeleton formType="login" />}>
                  <LoginForm />
                </Suspense>
              } />
              <Route path="/register" element={
                <Suspense fallback={<AuthSkeleton formType="register" />}>
                  <RegisterForm />
                </Suspense>
              } />
              <Route path="/reset-password" element={
                <Suspense fallback={<AuthSkeleton formType="reset" />}>
                  <ResetPasswordPage />
                </Suspense>
              } />
              
              {/* Protected routes with MainLayout and lazy loading */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <DashboardPage />
                  </Suspense>
                } />
                <Route path="profile" element={
                  <Suspense fallback={<ProfileSkeleton />}>
                    <ProfilePage />
                  </Suspense>
                } />
                <Route 
                  path="guests" 
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN, UserRole.STAFF]}>
                      <Suspense fallback={<ListSkeleton />}>
                        <GuestsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="vendors" 
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN, UserRole.STAFF]}>
                      <Suspense fallback={<ListSkeleton />}>
                        <VendorsPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="users" 
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN]}>
                      <Suspense fallback={<ListSkeleton />}>
                        <UsersPage />
                      </Suspense>
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