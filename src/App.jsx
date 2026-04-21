import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import DailyOrganization from './pages/admin/DailyOrganization';
import CaptainOrganization from './pages/admin/CaptainOrganization';
import DepartmentsUsers from './pages/admin/DepartmentsUsers';
import Productivity from './pages/admin/Productivity';

import UserLayout from './pages/user/UserLayout';

// Simple protective route component
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />; // or to unauthorized
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* ADMIN ROUTES */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="daily" replace />} />
              <Route path="daily" element={<DailyOrganization />} />
              <Route path="captains" element={
                <ProtectedRoute allowedRoles={['admin']}>
                   <CaptainOrganization />
                </ProtectedRoute>
              } />
              <Route path="departments" element={
                <ProtectedRoute allowedRoles={['admin']}>
                   <DepartmentsUsers />
                </ProtectedRoute>
              } />
              <Route path="productivity" element={
                <ProtectedRoute allowedRoles={['admin']}>
                   <Productivity />
                </ProtectedRoute>
              } />
            </Route>

            {/* USER ROUTES */}
            <Route 
              path="/user" 
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="daily" replace />} />
              <Route path="daily" element={<DailyOrganization />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
