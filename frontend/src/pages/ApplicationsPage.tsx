import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Eye,
  Download,
} from 'lucide-react';
import { exportApplicationsToCsv } from '../lib/exportCsv';
import { applicationsApi } from '../lib/api';
import { Application, ApplicationStatus, JobType, LocationType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { formatSalaryRange, formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('applied_date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await applicationsApi.list({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        location_type: locationTypeFilter !== 'all' ? locationTypeFilter : undefined,
        job_type: jobTypeFilter !== 'all' ? jobTypeFilter : undefined,
        sort_by: sortBy,
        order: sortOrder,
      });
      setApplications(res.applications);
    } catch (err: any) {
      error('Failed to load applications', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const handleUpdate = () => fetchApplications();
    window.addEventListener('application-updated', handleUpdate);
    return () => window.removeEventListener('application-updated', handleUpdate);
  }, [search, statusFilter, locationTypeFilter, jobTypeFilter, sortBy, sortOrder]);

  const handleCreateOrUpdate = async (data: Partial<Application>) => {
    setIsSubmitting(true);
    try {
      if (editingApp) {
        await applicationsApi.update(editingApp.id, data);
        success('Updated', `Saved changes to ${data.company || editingApp.company}`);
      } else {
        await applicationsApi.create(data);
        success('Created', `Added ${data.company} to pipeline`);
      }
      setIsModalOpen(false);
      setEditingApp(null);
      fetchApplications();
    } catch (err: any) {
      error('Error saving application', err.response?.data?.error?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    setIsDeleting(true);
    try {
      await applicationsApi.delete(deletingApp.id);
      success('Deleted', `Removed application for ${deletingApp.company}`);
      setDeletingApp(null);
      fetchApplications();
    } catch (err: any) {
      error('Failed to delete application', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      success('Status Updated', `Moved to ${newStatus}`);
      fetchApplications();
    } catch (err: any) {
      error('Could not update status', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Job Applications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and manage all your tracked job opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Cards Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportApplicationsToCsv(applications)}
            disabled={applications.length === 0}
            className="gap-1.5"
            title="Download CSV report of all applications"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Export</span> CSV
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by company, role, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Applied', label: 'Applied' },
              { value: 'Screening', label: 'Screening' },
              { value: 'Interview', label: 'Interview' },
              { value: 'Offer', label: 'Offer' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'Withdrawn', label: 'Withdrawn' },
            ]}
          />

          {/* Workplace Mode Filter */}
          <Select
            value={locationTypeFilter}
            onChange={(e) => setLocationTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Workplace Types' },
              { value: 'Remote', label: 'Remote' },
              { value: 'Hybrid', label: 'Hybrid' },
              { value: 'On-site', label: 'On-site' },
            ]}
          />

          {/* Sort By */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so as 'asc' | 'desc');
            }}
            options={[
              { value: 'applied_date-desc', label: 'Newest Applied' },
              { value: 'applied_date-asc', label: 'Oldest Applied' },
              { value: 'company-asc', label: 'Company (A-Z)' },
              { value: 'deadline-asc', label: 'Nearest Deadline' },
            ]}
          />
        </div>
      </div>

      {/* Main Content: Table View vs Grid Cards View */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No applications found"
          description={
            search || statusFilter !== 'all'
              ? 'Try modifying your search query or status filter.'
              : 'Start logging jobs to track your pipeline, scheduled rounds, and offers.'
          }
          actionLabel="Add Your First Application"
          onAction={() => {
            setEditingApp(null);
            setIsModalOpen(true);
          }}
        />
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Company & Role</th>
                <th className="py-3.5 px-4 font-semibold">Location / Mode</th>
                <th className="py-3.5 px-4 font-semibold">Salary Range</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Applied Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {app.company.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          {app.company}
                          {app.job_url && (
                            <a
                              href={app.job_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-slate-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{app.job_title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{app.location || 'Remote'}</span>
                      <span className="text-[10px] text-slate-500">({app.location_type})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {formatSalaryRange(app.salary_min, app.salary_max, app.salary_currency)}
                  </td>
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="bg-transparent border-0 text-xs font-semibold focus:ring-0 cursor-pointer p-0"
                    >
                      <option value="Applied" className="bg-slate-900 text-blue-400">Applied</option>
                      <option value="Screening" className="bg-slate-900 text-purple-400">Screening</option>
                      <option value="Interview" className="bg-slate-900 text-amber-400">Interview</option>
                      <option value="Offer" className="bg-slate-900 text-emerald-400">Offer</option>
                      <option value="Accepted" className="bg-slate-900 text-teal-400">Accepted</option>
                      <option value="Rejected" className="bg-slate-900 text-rose-400">Rejected</option>
                      <option value="Withdrawn" className="bg-slate-900 text-zinc-400">Withdrawn</option>
                    </select>
                    <div className="mt-1">
                      <Badge status={app.status} />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {formatDate(app.applied_date)}
                  </td>
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingApp(app);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Application"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingApp(app)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group"
              onClick={() => navigate(`/applications/${app.id}`)}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                        {app.company}
                      </h3>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">
                        {app.job_title}
                      </p>
                    </div>
                  </div>
                  <Badge status={app.status} />
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{app.location || 'Remote'} ({app.location_type})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{formatSalaryRange(app.salary_min, app.salary_max, app.salary_currency)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Applied: {formatDate(app.applied_date)}</span>
                  </div>
                </div>

                {app.notes && (
                  <p className="mt-3 text-[11px] text-slate-400/90 line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                    "{app.notes}"
                  </p>
                )}
              </div>

              <div
                className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        (app.rating || 3) >= s
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingApp(app);
                      setIsModalOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingApp(app)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingApp}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingApp)}
        onClose={() => setDeletingApp(null)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Are you sure you want to delete your application for ${deletingApp?.company}? This will remove all associated interview notes and tasks.`}
        confirmText="Delete Application"
        isLoading={isDeleting}
      />
    </div>
  );
};
