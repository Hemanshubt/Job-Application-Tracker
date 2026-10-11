import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MoreHorizontal,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calculator,
} from 'lucide-react';
import { applicationsApi } from '../lib/api';
import { Application, ApplicationStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { OfferComparisonModal } from '../components/analytics/OfferComparisonModal';
import { formatSalaryRange, formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface ColumnDef {
  status: ApplicationStatus;
  title: string;
  colorClass: string;
  badgeClass: string;
}

const COLUMNS: ColumnDef[] = [
  {
    status: 'Applied',
    title: 'Applied',
    colorClass: 'border-blue-500/30 bg-blue-500/5',
    badgeClass: 'bg-blue-500/20 text-blue-400',
  },
  {
    status: 'Screening',
    title: 'Screening',
    colorClass: 'border-purple-500/30 bg-purple-500/5',
    badgeClass: 'bg-purple-500/20 text-purple-400',
  },
  {
    status: 'Interview',
    title: 'Interview',
    colorClass: 'border-amber-500/30 bg-amber-500/5',
    badgeClass: 'bg-amber-500/20 text-amber-400',
  },
  {
    status: 'Offer',
    title: 'Offer',
    colorClass: 'border-emerald-500/30 bg-emerald-500/5',
    badgeClass: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    status: 'Accepted',
    title: 'Accepted',
    colorClass: 'border-teal-500/30 bg-teal-500/5',
    badgeClass: 'bg-teal-500/20 text-teal-400',
  },
  {
    status: 'Rejected',
    title: 'Rejected',
    colorClass: 'border-rose-500/30 bg-rose-500/5',
    badgeClass: 'bg-rose-500/20 text-rose-400',
  },
  {
    status: 'Withdrawn',
    title: 'Withdrawn',
    colorClass: 'border-zinc-500/30 bg-zinc-500/5',
    badgeClass: 'bg-zinc-500/20 text-zinc-400',
  },
];

export const KanbanPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<ApplicationStatus>('Applied');

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchApps = async () => {
    try {
      setIsLoading(true);
      const res = await applicationsApi.list({ limit: 100 });
      setApplications(res.applications);
    } catch (err: any) {
      error('Failed to load board', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    const handleUpdate = () => fetchApps();
    window.addEventListener('application-updated', handleUpdate);
    return () => window.removeEventListener('application-updated', handleUpdate);
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!id) return;

    const currentApp = applications.find((a) => a.id === id);
    if (!currentApp || currentApp.status === targetStatus) return;

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: targetStatus } : app))
    );

    try {
      await applicationsApi.updateStatus(id, targetStatus);
      success('Status Moved', `${currentApp.company} is now in ${targetStatus}`);
    } catch (err: any) {
      error('Failed to move application', err.message);
      fetchApps();
    } finally {
      setDraggedAppId(null);
    }
  };

  const moveStatus = async (appId: string, direction: 'prev' | 'next') => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    const order: ApplicationStatus[] = [
      'Applied',
      'Screening',
      'Interview',
      'Offer',
      'Accepted',
    ];
    const currentIndex = order.indexOf(app.status);
    if (currentIndex === -1) return;

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= order.length) return;

    const nextStatus = order[nextIndex];
    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a))
    );

    try {
      await applicationsApi.updateStatus(appId, nextStatus);
      success('Updated', `Moved to ${nextStatus}`);
    } catch (err: any) {
      error('Failed to change status', err.message);
      fetchApps();
    }
  };

  const openAddModal = (status: ApplicationStatus) => {
    setModalDefaultStatus(status);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Kanban Application Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Drag and drop applications or advance stages through the pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsOfferModalOpen(true)}
            className="gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
          >
            <Calculator className="w-4 h-4 text-emerald-400" /> Compare Offers
          </Button>

          <Button
            size="sm"
            onClick={() => openAddModal('Applied')}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Application
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-14rem)]">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.status);

          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className="flex-shrink-0 w-80 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm max-h-[calc(100vh-14rem)]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    {col.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.badgeClass}`}
                  >
                    {colApps.length}
                  </span>
                </div>
                <button
                  onClick={() => openAddModal(col.status)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={`Add application to ${col.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Cards List */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                {colApps.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-[11px] text-slate-500">
                    Drop roles here
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="group p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                            {app.company}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {app.job_title}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span className="text-[10px] font-bold">{app.rating || 3}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{app.location || 'Remote'} ({app.location_type})</span>
                        </div>
                        {(app.salary_min || app.salary_max) && (
                          <div className="flex items-center gap-1.5 font-medium text-slate-300">
                            <DollarSign className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{formatSalaryRange(app.salary_min, app.salary_max, app.salary_currency)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Applied: {formatDate(app.applied_date)}</span>
                        </div>
                      </div>

                      {/* Quick stage advance buttons */}
                      <div
                        className="pt-2 border-t border-slate-800/60 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] text-slate-500">
                          {app.interviews?.length ? `${app.interviews.length} rounds logged` : app.job_type}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveStatus(app.id, 'prev')}
                            disabled={app.status === 'Applied'}
                            className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                            title="Move to previous stage"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveStatus(app.id, 'next')}
                            disabled={app.status === 'Accepted'}
                            className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                            title="Advance to next stage"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await applicationsApi.create(data);
          setIsModalOpen(false);
          fetchApps();
        }}
        defaultStatus={modalDefaultStatus}
      />

      {/* Offer Comparison & CTC Calculator Modal */}
      <OfferComparisonModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />
    </div>
  );
};
