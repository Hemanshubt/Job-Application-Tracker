import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Loader2 } from 'lucide-react';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailsPage } from './pages/ApplicationDetailsPage';
import { KanbanPage } from './pages/KanbanPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { ContactsPage } from './pages/ContactsPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const HomeRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400 font-medium">Loading Trackr...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Root / Main App Routes */}
            <Route path="/" element={<HomeRoute />}>
              <Route index element={<DashboardPage />} />
              <Route path="applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
              <Route path="applications/:id" element={<ProtectedRoute><ApplicationDetailsPage /></ProtectedRoute>} />
              <Route path="kanban" element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
              <Route path="interviews" element={<ProtectedRoute><InterviewsPage /></ProtectedRoute>} />
              <Route path="contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
              <Route path="tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
