import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GeneratorHomePage } from './pages/GeneratorHomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BatchBuilderPage } from './pages/BatchBuilderPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { MemberBatchPage } from './pages/MemberBatchPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Homepage card generator */}
        <Route path="/" element={<GeneratorHomePage />} />

        {/* Dynamic public member batch link */}
        <Route path="/b/:slug" element={<MemberBatchPage />} />

        {/* Admin Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/batches/new" element={<BatchBuilderPage />} />
        <Route path="/admin/batches/:id" element={<BatchBuilderPage />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
