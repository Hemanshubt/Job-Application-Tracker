import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ApplicationModal } from '../applications/ApplicationModal';
import { applicationsApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Application } from '../../types';

export const AppLayout: React.FC = () => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleCreateApplication = async (data: Partial<Application>) => {
    setIsSubmittingApp(true);
    try {
      const created = await applicationsApi.create(data);
      success('Application Added', `Successfully tracking ${created.company} (${created.job_title})`);
      setIsAppModalOpen(false);
      // Trigger navigation or custom event so pages re-render
      window.dispatchEvent(new CustomEvent('application-updated'));
    } catch (err: any) {
      error('Failed to create application', err.response?.data?.error?.message || err.message);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpenMobile}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpenMobile(true)}
          onOpenNewApplicationModal={() => setIsAppModalOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Quick Add Application Modal */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSubmit={handleCreateApplication}
        isLoading={isSubmittingApp}
      />
    </div>
  );
};
