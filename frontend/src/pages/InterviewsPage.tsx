import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Trash2,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { interviewsApi, applicationsApi } from '../lib/api';
import { Interview, Application, InterviewOutcome, InterviewType } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatDate, formatDateTime } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const InterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [deletingInterview, setDeletingInterview] = useState<Interview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<Interview>>({
    application_id: '',
    round_name: '',
    interview_type: 'Technical',
    scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    duration_minutes: 45,
    interviewer_names: '',
    interviewer_emails: '',
    meeting_url: '',
    prep_notes: '',
    feedback: '',
    outcome: 'Scheduled',
  });

  const { success, error } = useToast();

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      const [intList, appList] = await Promise.all([
        interviewsApi.list(),
        applicationsApi.list({ limit: 100 }),
      ]);
      setInterviews(intList);
      setApplications(appList.applications);
      if (appList.applications.length > 0 && !form.application_id) {
        setForm((prev) => ({ ...prev, application_id: appList.applications[0].id }));
      }
    } catch (err: any) {
      error('Failed to load interviews', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleOpenAdd = () => {
    setEditingInterview(null);
    setForm({
      application_id: applications[0]?.id || '',
      round_name: '',
      interview_type: 'Technical',
      scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      duration_minutes: 45,
      interviewer_names: '',
      interviewer_emails: '',
      meeting_url: '',
      prep_notes: '',
      feedback: '',
      outcome: 'Scheduled',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (int: Interview) => {
    setEditingInterview(int);
    setForm({
      ...int,
      scheduled_at: new Date(int.scheduled_at).toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.application_id || !form.round_name || !form.scheduled_at) {
      error('Missing fields', 'Application, round name, and time are required.');
      return;
    }

    try {
      const payload = {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: Number(form.duration_minutes) || 45,
      };

      if (editingInterview) {
        await interviewsApi.update(editingInterview.id, payload);
        success('Interview Updated', 'Saved changes to schedule.');
      } else {
        await interviewsApi.create(payload);
        success('Interview Scheduled', `${form.round_name} scheduled.`);
      }

      setIsModalOpen(false);
      loadInterviews();
    } catch (err: any) {
      error('Error saving interview', err.response?.data?.error?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingInterview) return;
    setIsDeleting(true);
    try {
      await interviewsApi.delete(deletingInterview.id);
      success('Interview Deleted', 'Removed scheduled round.');
      setDeletingInterview(null);
      loadInterviews();
    } catch (err: any) {
      error('Failed to delete interview', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOutcomeChange = async (id: string, outcome: InterviewOutcome) => {
    try {
      await interviewsApi.update(id, { outcome });
      success('Outcome Updated', `Marked as ${outcome}`);
      loadInterviews();
    } catch (err: any) {
      error('Failed to update outcome', err.message);
    }
  };

  const upcomingInterviews = interviews.filter((i) => i.outcome === 'Scheduled');
  const completedInterviews = interviews.filter((i) => i.outcome !== 'Scheduled');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Interview Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track interview rounds, prep briefs, video meeting URLs, and outcome debriefs.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5">
          <Plus className="w-4 h-4" /> Schedule Interview
        </Button>
      </div>

      {/* Upcoming Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-amber-400" />
          Scheduled Rounds ({upcomingInterviews.length})
        </h2>

        {isLoading ? (
          <div className="h-40 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : upcomingInterviews.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming interviews"
            description="You don't have any interviews scheduled currently."
            actionLabel="Schedule Next Round"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInterviews.map((int) => (
              <Card
                key={int.id}
                className="bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      {int.application?.company || 'Company'}
                    </span>
                    <h3 className="font-bold text-base text-white tracking-tight">
                      {int.round_name}
                    </h3>
                    <p className="text-xs text-slate-400">{int.interview_type} • {int.duration_minutes} mins</p>
                  </div>
                  <Badge outcome={int.outcome} />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{formatDateTime(int.scheduled_at)}</span>
                  </div>
                  {int.meeting_url && (
                    <a
                      href={int.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 inline-flex items-center gap-1.5 shadow-sm"
                    >
                      Join Meeting <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {int.prep_notes && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-slate-200 block mb-1">Study Prep Notes:</span>
                    <p className="line-clamp-2">{int.prep_notes}</p>
                  </div>
                )}

                {int.interviewer_names && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Panel: {int.interviewer_names}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Update Outcome:</span>
                    <select
                      value={int.outcome}
                      onChange={(e) => handleOutcomeChange(int.id, e.target.value as InterviewOutcome)}
                      className="bg-slate-950 text-xs font-semibold text-slate-200 border border-slate-800 rounded px-2 py-1"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Passed">Passed</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(int)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingInterview(int)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400"
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
      </div>

      {/* Completed & Past Interviews Section */}
      {completedInterviews.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Completed Rounds & History ({completedInterviews.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedInterviews.map((int) => (
              <Card key={int.id} className="bg-slate-900/50 border-slate-800 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{int.round_name}</h4>
                    <p className="text-xs text-slate-400">{int.application?.company}</p>
                  </div>
                  <Badge outcome={int.outcome} />
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formatDate(int.scheduled_at)}
                </p>
                {int.feedback && (
                  <p className="text-[11px] text-slate-300 italic bg-slate-950/40 p-2 rounded border border-slate-800">
                    "{int.feedback}"
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInterview ? 'Edit Interview' : 'Schedule Interview Round'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Associated Application *"
            value={form.application_id || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, application_id: e.target.value }))}
            required
            options={applications.map((a) => ({
              value: a.id,
              label: `${a.company} (${a.job_title})`,
            }))}
          />

          <Input
            label="Round Name *"
            placeholder="e.g. Recruiter Screen, Technical Coding, System Design"
            value={form.round_name || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, round_name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Interview Type"
              value={form.interview_type || 'Technical'}
              onChange={(e) => setForm((prev) => ({ ...prev, interview_type: e.target.value as InterviewType }))}
              options={[
                { value: 'Phone Screen', label: 'Phone Screen' },
                { value: 'Recruiter Screen', label: 'Recruiter Screen' },
                { value: 'Technical', label: 'Technical' },
                { value: 'System Design', label: 'System Design' },
                { value: 'Behavioral', label: 'Behavioral' },
                { value: 'Hiring Manager', label: 'Hiring Manager' },
                { value: 'Take-home', label: 'Take-home' },
                { value: 'Final Round', label: 'Final Round' },
              ]}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.duration_minutes || 45}
              onChange={(e) => setForm((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date & Time *"
              type="datetime-local"
              value={form.scheduled_at || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, scheduled_at: e.target.value }))}
              required
            />
            <Select
              label="Outcome Status"
              value={form.outcome || 'Scheduled'}
              onChange={(e) => setForm((prev) => ({ ...prev, outcome: e.target.value as InterviewOutcome }))}
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Passed', label: 'Passed' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Failed', label: 'Failed' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          <Input
            label="Video Conference / Meeting URL"
            placeholder="https://meet.google.com/xyz or Zoom link"
            value={form.meeting_url || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, meeting_url: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Interviewer Name(s)"
              placeholder="Elena Rostova (Staff SWE)"
              value={form.interviewer_names || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, interviewer_names: e.target.value }))}
            />
            <Input
              label="Interviewer Email(s)"
              placeholder="elena@company.com"
              value={form.interviewer_emails || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, interviewer_emails: e.target.value }))}
            />
          </div>

          <Textarea
            label="Prep Strategy & Agenda"
            placeholder="Topics to master, portfolio projects to demo, questions to ask..."
            rows={2}
            value={form.prep_notes || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, prep_notes: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingInterview ? 'Save Changes' : 'Schedule Round'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingInterview)}
        onClose={() => setDeletingInterview(null)}
        onConfirm={handleDelete}
        title="Delete Interview"
        message={`Are you sure you want to remove the "${deletingInterview?.round_name}" interview?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
